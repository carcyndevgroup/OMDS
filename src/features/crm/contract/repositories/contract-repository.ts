import type { SupabaseClient } from "@supabase/supabase-js";

import type { Locale } from "@/core/i18n";
import type { Database } from "@/core/supabase/database.types";
import type { Json } from "@/core/supabase/json.types";
import { createHash } from "node:crypto";

import { createInvoiceFromAcceptedQuote } from "../../invoice/repositories/invoice-repository";
import { syncClientPortalAccess } from "../../portal/repositories/client-portal-repository";
import type { Contract, ContractStatus } from "../types/contract";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

export const CONTRACT_ACCEPTANCE_TEXT = "By checking this box, I acknowledge that I am signing this agreement electronically and that my electronic signature is the legally binding equivalent of my handwritten signature.";

export function buildContractSigningData(input: {
  accessKey?: string;
  contractBody: string;
  existingAudit: Json[];
  ipAddress?: string;
  signedAt: string;
  userAgent?: string;
  consentText?: string;
}) {
  const consentText = input.consentText ?? CONTRACT_ACCEPTANCE_TEXT;
  const documentHash = createHash("sha256").update(input.contractBody, "utf8").digest("hex");
  return {
    acceptance: { accepted: true, acceptedAt: input.signedAt, accessKey: input.accessKey ?? null, consentText },
    signingMetadata: {
      authenticationMethod: "client_portal_access_key",
      consentText,
      documentHash,
      ipAddress: input.ipAddress ?? null,
      signedAt: input.signedAt,
      userAgent: input.userAgent ?? null,
    },
    auditTrail: [
      ...input.existingAudit,
      { at: input.signedAt, event: "terms_accepted", source: "client_portal" },
      { at: input.signedAt, event: "contract_signed", source: "client_portal" },
    ],
  };
}

function readContractDataRecord(value: Json): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

async function applyContractBodySnapshot(
  database: SupabaseClient<Database>,
  contract: Pick<ContractRow, "id" | "contract_data" | "template_key">,
) {
  const current = readContractDataRecord(contract.contract_data);
  const currentBody = typeof current.body === "string" ? current.body.trim() : "";
  if (currentBody) return;

  const templateResult = await database
    .from("contract_templates")
    .select("body")
    .eq("template_key", contract.template_key)
    .maybeSingle();
  if (templateResult.error) throw templateResult.error;

  const templateBody = templateResult.data?.body?.trim() ?? "";
  if (!templateBody) return;

  const contractData: Json = {
    ...current,
    body: templateBody,
  };

  const updateResult = await database
    .from("contracts")
    .update({ contract_data: contractData })
    .eq("id", contract.id);
  if (updateResult.error) throw updateResult.error;
}

const mapContract = (row: ContractRow): Contract => ({
  contractData: row.contract_data,
  createdAt: row.created_at,
  eventId: row.event_id,
  id: row.id,
  internalNotes: row.internal_notes,
  legalSignatureName: row.legal_signature_name,
  locale: row.locale === "es" ? "es" : "en",
  sentAt: row.sent_at,
  signedAt: row.signed_at,
  status: row.status as ContractStatus,
  templateKey: row.template_key,
  title: row.title,
  updatedAt: row.updated_at,
  voidedAt: row.voided_at,
});

export async function createContract(
  database: SupabaseClient<Database>,
  eventId: string,
  locale: Locale,
) {
  const templateKey = await resolveContractTemplateKeyForEvent(database, eventId);
  const result = await database
    .from("contracts")
    .insert({
      event_id: eventId,
      locale,
      ...(templateKey ? { template_key: templateKey } : {}),
    })
    .select("*")
    .single();

  if (result.error) throw result.error;
  await applyContractBodySnapshot(database, result.data);
  return mapContract(result.data);
}

export async function ensureReadyContractForEvent(
  database: SupabaseClient<Database>,
  eventId: string,
  locale: Locale,
) {
  const templateKey = await resolveContractTemplateKeyForEvent(database, eventId);
  if (!templateKey) return null;

  const existing = await database
    .from("contracts")
    .select("*")
    .eq("event_id", eventId)
    .eq("template_key", templateKey)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data) {
    if (existing.data.status === "draft") {
      const sent = await database
        .from("contracts")
        .update({ sent_at: new Date().toISOString(), status: "sent" })
        .eq("id", existing.data.id)
        .select("*")
        .single();

      if (sent.error) throw sent.error;
      await applyContractBodySnapshot(database, sent.data);
      await syncClientPortalAccess(database, eventId);
      return mapContract(sent.data);
    }

    return mapContract(existing.data);
  }

  const created = await database
    .from("contracts")
    .insert({
      event_id: eventId,
      locale,
      sent_at: new Date().toISOString(),
      status: "sent",
      template_key: templateKey,
    })
    .select("*")
    .single();

  if (created.error) throw created.error;
  await applyContractBodySnapshot(database, created.data);
  await syncClientPortalAccess(database, eventId);
  return mapContract(created.data);
}

export async function listContracts(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const result = await database
    .from("contracts")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (result.error) throw result.error;
  return result.data.map(mapContract);
}

export async function sendContract(
  database: SupabaseClient<Database>,
  contractId: string,
) {
  const existing = await database
    .from("contracts")
    .select("id,template_key,contract_data")
    .eq("id", contractId)
    .single();
  if (existing.error) throw existing.error;

  await applyContractBodySnapshot(database, existing.data);

  const result = await database
    .from("contracts")
    .update({ sent_at: new Date().toISOString(), status: "sent" })
    .eq("id", contractId)
    .select("event_id")
    .single();

  if (result.error) throw result.error;
  await syncClientPortalAccess(database, result.data.event_id);
}

export async function signContract(
  database: SupabaseClient<Database>,
  contractId: string,
  acceptance: {
    accepted: boolean;
    accessKey?: string;
    consentText?: string;
    ipAddress?: string;
    userAgent?: string;
  } = { accepted: true },
) {
  const contract = await database
    .from("contracts")
    .select("event_id,contract_data,sent_at,created_at,status")
    .eq("id", contractId)
    .single();
  if (contract.error) throw contract.error;

  if (!acceptance.accepted) throw new Error("contract_acceptance_required");
  if (contract.data.status === "signed") return;
  if (contract.data.status !== "sent") throw new Error("contract_not_signable");

  const currentData = contract.data.contract_data && typeof contract.data.contract_data === "object" && !Array.isArray(contract.data.contract_data)
    ? contract.data.contract_data as Record<string, unknown>
    : {};
  const existingAudit = Array.isArray(currentData.auditTrail) ? currentData.auditTrail as Json[] : [];
  const signedAt = new Date().toISOString();
  const signingData = buildContractSigningData({
    accessKey: acceptance.accessKey,
    contractBody: typeof currentData.body === "string" ? currentData.body : "",
    existingAudit,
    ipAddress: acceptance.ipAddress,
    signedAt,
    userAgent: acceptance.userAgent,
    consentText: acceptance.consentText,
  });
  const result = await database
    .from("contracts")
    .update({
      contract_data: {
        ...currentData,
        acceptance: signingData.acceptance,
        signingMetadata: signingData.signingMetadata,
        auditTrail: signingData.auditTrail,
      },
      signed_at: signedAt,
      status: "signed",
    })
    .eq("id", contractId)
    .eq("status", "sent")
    .select("id")
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) return;
  const auditRows = ["terms_accepted", "contract_signed"].map((eventType) => ({
    contract_id: contractId,
    event_type: eventType,
    occurred_at: signedAt,
    actor_type: "client",
    authentication_method: signingData.signingMetadata.authenticationMethod,
    ip_address: signingData.signingMetadata.ipAddress,
    user_agent: signingData.signingMetadata.userAgent,
    metadata: {
      consentText: signingData.signingMetadata.consentText,
      documentHash: signingData.signingMetadata.documentHash,
      accessKeyHash: acceptance.accessKey
        ? createHash("sha256").update(acceptance.accessKey, "utf8").digest("hex")
        : null,
    },
  }));
  const auditResult = await database.from("contract_audit_events").insert(auditRows);
  if (auditResult.error) throw auditResult.error;
  await createInvoiceFromAcceptedQuote(database, contract.data.event_id, contractId);
  await confirmPreferredVendorEvent(database, contract.data.event_id);
  await syncClientPortalAccess(database, contract.data.event_id);
}

export async function voidContract(
  database: SupabaseClient<Database>,
  contractId: string,
) {
  const result = await database
    .from("contracts")
    .update({ status: "void", voided_at: new Date().toISOString() })
    .eq("id", contractId)
    .select("event_id")
    .single();

  if (result.error) throw result.error;
  await syncClientPortalAccess(database, result.data.event_id);
}

async function confirmPreferredVendorEvent(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const result = await database
    .from("events")
    .update({ booking_status: "confirmed" })
    .eq("id", eventId)
    .eq("booking_type", "preferred_vendor");

  if (result.error) throw result.error;
}

async function resolveContractTemplateKeyForEvent(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const acceptedQuoteResult = await database
    .from("quotes")
    .select("accepted_version_id,status")
    .eq("event_id", eventId)
    .eq("status", "accepted")
    .not("accepted_version_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (acceptedQuoteResult.error) throw acceptedQuoteResult.error;

  const acceptedVersionId = acceptedQuoteResult.data?.accepted_version_id;
  if (acceptedVersionId) {
    const acceptedVersionResult = await database
      .from("quote_versions")
      .select("contract_template_key")
      .eq("id", acceptedVersionId)
      .maybeSingle();

    if (acceptedVersionResult.error) throw acceptedVersionResult.error;
    if (acceptedVersionResult.data?.contract_template_key) {
      return acceptedVersionResult.data.contract_template_key;
    }
  }

  const latestQuoteResult = await database
    .from("quotes")
    .select("id")
    .eq("event_id", eventId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestQuoteResult.error) throw latestQuoteResult.error;

  const latestQuoteId = latestQuoteResult.data?.id;
  if (!latestQuoteId) return null;

  const latestVersionResult = await database
    .from("quote_versions")
    .select("contract_template_key")
    .eq("quote_id", latestQuoteId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestVersionResult.error) throw latestVersionResult.error;

  const quoteTemplateKey = latestVersionResult.data?.contract_template_key;
  if (quoteTemplateKey) return quoteTemplateKey;

  // Final fallback: use the default contract template matched to the event's booking type.
  // This ensures contracts are created even when no template was explicitly selected in the
  // Quote Builder, as long as a default template exists for that booking type.
  const eventResult = await database
    .from("events")
    .select("booking_type")
    .eq("id", eventId)
    .maybeSingle();

  if (eventResult.error) throw eventResult.error;

  const bookingType = eventResult.data?.booking_type ?? null;

  const defaultTemplateResult = await database
    .from("contract_templates")
    .select("template_key,booking_type")
    .eq("is_default", true)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(10);

  if (defaultTemplateResult.error) throw defaultTemplateResult.error;

  const defaultTemplates = defaultTemplateResult.data ?? [];

  // Prefer a default template whose booking_type matches the event's booking type.
  const matched = bookingType
    ? defaultTemplates.find((row) => row.booking_type === bookingType)
    : null;

  const fallback = matched ?? defaultTemplates[0] ?? null;
  return fallback?.template_key ?? null;
}
