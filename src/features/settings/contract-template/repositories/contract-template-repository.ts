import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { BookingType } from "@/features/crm/client/types/client";
import type { EventType } from "@/features/crm/shared/types/crm-options";

import type {
  ContractTemplate,
  ContractTemplateFormValues,
  ContractTemplateVersion,
} from "../types/contract-template";
import {
  DIRECT_CONTRACT_DEFAULT_BODY,
  PV_CONTRACT_DEFAULT_BODY,
} from "./contract-template-defaults";

type ContractTemplateRow = Database["public"]["Tables"]["contract_templates"]["Row"];
type ContractTemplateVersionRow = Database["public"]["Tables"]["contract_template_versions"]["Row"];

function normalizeContractTemplateBody(templateKey: string, body: string | null | undefined) {
  if (templateKey === "direct_contract") {
    if (!body || /<h1>Oh My Desserts|<h2>Catering Services Contract|<h2>PREAMBLE<\/h2>/i.test(body)) {
      return DIRECT_CONTRACT_DEFAULT_BODY;
    }
    return body;
  }

  if (templateKey === "pv_service_terms") {
    if (!body || /Preferred Vendor Event Service Terms/i.test(body)) {
      return PV_CONTRACT_DEFAULT_BODY;
    }
    return body;
  }

  return body ?? "";
}

export const DEFAULT_TEMPLATE_DELETE_FORBIDDEN = "default_template_delete_forbidden";
export const TEMPLATE_IN_USE_DELETE_FORBIDDEN = "template_in_use_delete_forbidden";

export type ContractTemplateUsageSummary = {
  contracts: number;
  linkedRecords: number;
  quoteVersions: number;
  templateKey: string;
};

function createGuardedError(code: string) {
  return Object.assign(new Error(code), { code });
}

const toContractTemplate = (row: ContractTemplateRow): ContractTemplate => ({
  body: normalizeContractTemplateBody(row.template_key, row.body),
  bookingType: row.booking_type as BookingType | "",
  createdAt: row.created_at,
  description: row.description,
  eventType: row.event_type as EventType | "",
  id: row.id,
  isActive: row.is_active,
  isDefault: row.is_default,
  templateKey: row.template_key,
  title: row.title,
  updatedAt: row.updated_at,
});

const toPayload = (values: ContractTemplateFormValues) => ({
  body: values.body.trim(),
  booking_type: values.bookingType || null,
  description: values.description.trim(),
  event_type: values.eventType || null,
  is_active: values.isActive,
  is_default: values.isDefault,
  template_key: values.templateKey.trim(),
  title: values.title.trim(),
});

const toContractTemplateVersion = (row: ContractTemplateVersionRow): ContractTemplateVersion => ({
  body: row.body,
  bookingType: (row.booking_type ?? "") as BookingType | "",
  createdAt: row.created_at,
  description: row.description,
  eventType: (row.event_type ?? "") as EventType | "",
  id: row.id,
  isActive: row.is_active,
  isDefault: row.is_default,
  templateId: row.template_id,
  templateKey: row.template_key,
  title: row.title,
  versionNumber: row.version_number,
});

async function snapshotContractTemplateVersion(
  database: SupabaseClient<Database>,
  row: ContractTemplateRow,
) {
  const latestVersion = await database
    .from("contract_template_versions")
    .select("version_number")
    .eq("template_id", row.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestVersion.error) throw latestVersion.error;
  const versionNumber = (latestVersion.data?.version_number ?? 0) + 1;
  const result = await database.from("contract_template_versions").insert({
    body: row.body,
    booking_type: row.booking_type,
    description: row.description,
    event_type: row.event_type,
    is_active: row.is_active,
    is_default: row.is_default,
    template_id: row.id,
    template_key: row.template_key,
    title: row.title,
    version_number: versionNumber,
  });
  if (result.error) throw result.error;
}

function hasContractTemplateChanges(current: ContractTemplateRow, next: ReturnType<typeof toPayload>) {
  return current.body !== next.body || current.booking_type !== next.booking_type
    || current.description !== next.description || current.event_type !== next.event_type
    || current.is_active !== next.is_active || current.is_default !== next.is_default
    || current.template_key !== next.template_key || current.title !== next.title;
}

export async function createContractTemplate(
  database: SupabaseClient<Database>,
  values: ContractTemplateFormValues,
) {
  const result = await database.from("contract_templates").insert(toPayload(values)).select("*").single();
  if (result.error) throw result.error;
  await snapshotContractTemplateVersion(database, result.data);
  return toContractTemplate(result.data);
}

export async function findContractTemplate(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("contract_templates").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toContractTemplate(result.data) : null;
}

export async function listContractTemplates(database: SupabaseClient<Database>) {
  const result = await database.from("contract_templates").select("*").order("is_default", { ascending: false }).order("title");
  if (result.error) throw result.error;
  return result.data.map(toContractTemplate);
}

export async function updateContractTemplate(
  database: SupabaseClient<Database>,
  id: string,
  values: ContractTemplateFormValues,
) {
  const payload = toPayload(values);
  const existingResult = await database.from("contract_templates").select("*").eq("id", id).maybeSingle();
  if (existingResult.error) throw existingResult.error;
  if (!existingResult.data) return null;

  if (hasContractTemplateChanges(existingResult.data, payload)) {
    await snapshotContractTemplateVersion(database, existingResult.data);
  }

  const result = await database.from("contract_templates").update(payload).eq("id", id).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toContractTemplate(result.data) : null;
}

export async function listContractTemplateVersions(
  database: SupabaseClient<Database>,
  templateId: string,
) {
  const result = await database
    .from("contract_template_versions")
    .select("*")
    .eq("template_id", templateId)
    .order("version_number", { ascending: false });
  if (result.error) throw result.error;
  return result.data.map(toContractTemplateVersion);
}

export async function rollbackContractTemplateVersion(
  database: SupabaseClient<Database>,
  templateId: string,
  versionId: string,
) {
  const versionResult = await database
    .from("contract_template_versions")
    .select("*")
    .eq("id", versionId)
    .eq("template_id", templateId)
    .maybeSingle();
  if (versionResult.error) throw versionResult.error;
  if (!versionResult.data) return null;

  const restored = await updateContractTemplate(database, templateId, {
    body: versionResult.data.body,
    bookingType: (versionResult.data.booking_type ?? "") as BookingType | "",
    description: versionResult.data.description,
    eventType: (versionResult.data.event_type ?? "") as EventType | "",
    isActive: versionResult.data.is_active,
    isDefault: versionResult.data.is_default,
    templateKey: versionResult.data.template_key,
    title: versionResult.data.title,
  });

  return restored;
}

export async function setContractTemplateActive(
  database: SupabaseClient<Database>,
  id: string,
  isActive: boolean,
) {
  const result = await database
    .from("contract_templates")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toContractTemplate(result.data) : null;
}

export async function deleteContractTemplate(database: SupabaseClient<Database>, id: string) {
  const templateResult = await database
    .from("contract_templates")
    .select("template_key,is_default")
    .eq("id", id)
    .maybeSingle();
  if (templateResult.error) throw templateResult.error;

  if (templateResult.data?.is_default) {
    throw createGuardedError(DEFAULT_TEMPLATE_DELETE_FORBIDDEN);
  }

  if (templateResult.data?.template_key) {
    const contractUsageResult = await database
      .from("contracts")
      .select("id")
      .eq("template_key", templateResult.data.template_key)
      .limit(1)
      .maybeSingle();
    if (contractUsageResult.error) throw contractUsageResult.error;

    const quoteVersionUsageResult = await database
      .from("quote_versions")
      .select("id")
      .eq("contract_template_key", templateResult.data.template_key)
      .limit(1)
      .maybeSingle();
    if (quoteVersionUsageResult.error) throw quoteVersionUsageResult.error;

    if (contractUsageResult.data || quoteVersionUsageResult.data) {
      throw createGuardedError(TEMPLATE_IN_USE_DELETE_FORBIDDEN);
    }
  }

  const result = await database.from("contract_templates").delete().eq("id", id);
  if (result.error) throw result.error;
}

export async function getContractTemplateUsageSummary(
  database: SupabaseClient<Database>,
  id: string,
) {
  const templateResult = await database
    .from("contract_templates")
    .select("template_key")
    .eq("id", id)
    .maybeSingle();
  if (templateResult.error) throw templateResult.error;
  if (!templateResult.data?.template_key) return null;

  const templateKey = templateResult.data.template_key;

  const [contractsResult, quoteVersionsResult] = await Promise.all([
    database
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("template_key", templateKey),
    database
      .from("quote_versions")
      .select("id", { count: "exact", head: true })
      .eq("contract_template_key", templateKey),
  ]);

  if (contractsResult.error) throw contractsResult.error;
  if (quoteVersionsResult.error) throw quoteVersionsResult.error;

  const contracts = contractsResult.count ?? 0;
  const quoteVersions = quoteVersionsResult.count ?? 0;

  return {
    contracts,
    linkedRecords: contracts + quoteVersions,
    quoteVersions,
    templateKey,
  } satisfies ContractTemplateUsageSummary;
}
