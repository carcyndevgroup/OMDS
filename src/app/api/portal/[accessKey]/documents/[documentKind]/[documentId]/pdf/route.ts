import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";
import { createServerSupabaseClient } from "@/core/supabase/server-client";
import {
  getPublicClientPortalAccess,
  listPublicPortalQuestionnaires,
  listPublicPortalQuotes,
} from "@/features/crm/portal/repositories/client-portal-repository";
import { resolveContractExportBody } from "@/features/crm/shared/documents/contract-export-body";
import { buildContractTokenOverrides } from "@/features/crm/shared/documents/contract-token-resolver";
import {
  listPublicPortalContracts,
  listPublicPortalInvoices,
} from "@/features/crm/portal/repositories/public-portal-documents-repository";
import {
  canDownloadQuestionnaire,
  mapPublicInvoiceToPdfModel,
  mapPublicQuoteToPdfModel,
} from "@/features/crm/portal/utils/public-portal-pdf-mappers";
import { buildDocumentFilename } from "@/features/crm/shared/documents/document-identifiers";
import {
  createContractPdfDocument,
  createInvoicePdfDocument,
  createQuestionnairePdfDocument,
  createQuotePdfDocument,
} from "@/features/crm/shared/pdf/document-pdf";
import { getCompanyProfile } from "@/features/settings/company-profile/repositories/company-profile-repository";
import { getSigningProfile } from "@/features/settings/signing-profile/repositories/signing-profile-repository";
import { DIRECT_CONTRACT_DEFAULT_BODY, PV_CONTRACT_DEFAULT_BODY } from "@/features/settings/contract-template/repositories/contract-template-defaults";

type DocumentKind = "contract" | "invoice" | "questionnaire" | "quote";

type PublicDocumentPdfRouteContext = {
  params: Promise<{
    accessKey: string;
    documentId: string;
    documentKind: string;
  }>;
};

const allowedKinds = new Set<DocumentKind>(["contract", "invoice", "questionnaire", "quote"]);

export async function GET(request: Request, props: PublicDocumentPdfRouteContext) {
  const params = await props.params;
  if (!allowedKinds.has(params.documentKind as DocumentKind)) {
    return NextResponse.json({ code: "invalid_document_kind" }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  const kind = params.documentKind as DocumentKind;
  const bytes = await resolveDocumentBytes(database, params.accessKey, kind, params.documentId);

  if (!bytes) return NextResponse.json({ code: "not_found" }, { status: 404 });

  const normalizedBytes = Uint8Array.from(bytes.pdf);
  const body = new Blob([normalizedBytes.buffer], { type: "application/pdf" });
  const filename = bytes.filename;

  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `${new URL(request.url).searchParams.get("inline") === "1" ? "inline" : "attachment"}; filename=\"${filename}\"`,
      "Content-Type": "application/pdf",
    },
    status: 200,
  });
}

async function resolveDocumentBytes(
  database: SupabaseClient<Database>,
  accessKey: string,
  kind: DocumentKind,
  documentId: string,
): Promise<{ filename: string; pdf: Uint8Array } | null> {
  if (kind === "quote") {
    const quotes = await listPublicPortalQuotes(database, accessKey);
    const quote = quotes.find((item) => item.id === documentId);
    if (!quote || !quote.hasBeenViewed || quote.status !== "accepted") return null;

    const quoteSummary = mapPublicQuoteToPdfModel(quote);
    const version = quoteSummary.currentVersion;
    if (!version) return null;

    return {
      filename: buildDocumentFilename("quote", quote.id, version.versionNumber),
      pdf: Uint8Array.from(await createQuotePdfDocument(quoteSummary, version)),
    };
  }

  if (kind === "invoice") {
    const invoices = await listPublicPortalInvoices(database, accessKey);
    const invoice = invoices.find((item) => item.invoiceId === documentId);
    if (!invoice || !invoice.hasBeenViewed) return null;

    const invoicePdfModel = mapPublicInvoiceToPdfModel(invoice, "");
    return {
      filename: buildDocumentFilename("invoice", invoice.invoiceId),
      pdf: Uint8Array.from(await createInvoicePdfDocument(invoicePdfModel)),
    };
  }

  if (kind === "contract") {
    const [contracts, companyProfile, signingProfile, portalAccess] = await Promise.all([
      listPublicPortalContracts(database, accessKey),
      getCompanyProfile(database),
      getSigningProfile(database),
      getPublicClientPortalAccess(database, accessKey),
    ]);
    const contract = contracts.find((item) => item.contractId === documentId);
    if (!contract || !contract.hasBeenViewed) return null;
    const contractRecord = await database
      .from("contracts")
      .select("contract_data,template_key")
      .eq("id", documentId)
      .maybeSingle();
    const contractData = contractRecord.data?.contract_data && typeof contractRecord.data.contract_data === "object" && !Array.isArray(contractRecord.data.contract_data)
      ? contractRecord.data.contract_data as Record<string, unknown>
      : {};
    const templateResult = await database
      .from("contract_templates")
      .select("body")
      .eq("template_key", contractRecord.data?.template_key ?? contract.templateKey)
      .maybeSingle();
    if (templateResult.error) throw templateResult.error;
    const contractSnapshotBody = typeof contractData.body === "string" ? contractData.body : "";
    const resolvedBody = resolveContractExportBody({
      contractBody: contractSnapshotBody,
      templateBody: templateResult.data?.body,
    }) || (contract.templateKey === "pv_service_terms" ? PV_CONTRACT_DEFAULT_BODY : DIRECT_CONTRACT_DEFAULT_BODY);

    const [eventResult, contactResult, quoteResult, invoiceResult] = await Promise.all([
      database.from("events").select("booking_type,event_date,event_name,event_type,guest_count,service_start_time,service_end_time,service_location_description").eq("id", portalAccess?.eventId ?? "").maybeSingle(),
      database.from("event_contacts").select("client_id").eq("event_id", portalAccess?.eventId ?? "").order("is_primary", { ascending: false }).limit(1).maybeSingle(),
      database.from("quotes").select("accepted_version_id").eq("event_id", portalAccess?.eventId ?? "").eq("status", "accepted").maybeSingle(),
      database.from("invoices").select("installment_key,total_mxn,due_at").eq("event_id", portalAccess?.eventId ?? "").neq("status", "void"),
    ]);
    if (eventResult.error) throw eventResult.error;
    if (contactResult.error) throw contactResult.error;
    if (quoteResult.error) throw quoteResult.error;
    if (invoiceResult.error) throw invoiceResult.error;

    let clientAddress = portalAccess?.clientAddress ?? null;
    let clientEmail: string | null = null;
    if (contactResult.data?.client_id) {
      const clientResult = await database.from("clients").select("street_address,city,state_province,country,email").eq("id", contactResult.data.client_id).maybeSingle();
      if (clientResult.error) throw clientResult.error;
      if (clientResult.data) {
        clientAddress = [clientResult.data.street_address, clientResult.data.city, clientResult.data.state_province, clientResult.data.country].filter(Boolean).join(", ");
        clientEmail = clientResult.data.email;
      }
    }

    let acceptedVersion: { payment_plan_id: string | null; display_currency: string; exchange_rate_to_mxn: number; subtotal_mxn: number; tax_total_mxn: number; total_mxn: number } | null = null;
    let acceptedItems: Array<{ description: string; details: string; quantity: number; line_total_mxn: number; unit_price_mxn: number }> = [];
    if (quoteResult.data?.accepted_version_id) {
      const [versionResult, itemsResult] = await Promise.all([
        database.from("quote_versions").select("payment_plan_id,display_currency,exchange_rate_to_mxn,subtotal_mxn,tax_total_mxn,total_mxn").eq("id", quoteResult.data.accepted_version_id).maybeSingle(),
        database.from("quote_items").select("description,details,quantity,line_total_mxn,unit_price_mxn").eq("quote_version_id", quoteResult.data.accepted_version_id).order("sort_order", { ascending: true }),
      ]);
      if (versionResult.error) throw versionResult.error;
      if (itemsResult.error) throw itemsResult.error;
      acceptedVersion = versionResult.data;
      acceptedItems = itemsResult.data ?? [];
    }
    const retainerInvoice = invoiceResult.data?.find((invoice) => invoice.installment_key === "retainer");
    const balanceInvoice = invoiceResult.data?.find((invoice) => invoice.installment_key === "balance");
    const paymentPlanResult = acceptedVersion
      ? await database.from("payment_plans").select("final_due_rule,final_due_days_before_event,final_payment_percent,retainer_percent").eq(acceptedVersion.payment_plan_id ? "id" : "is_default", acceptedVersion.payment_plan_id || true).maybeSingle()
      : { data: null, error: null };
    if (paymentPlanResult.error) throw paymentPlanResult.error;
    const paymentPlan = paymentPlanResult.data;
    const balanceDueDate = paymentPlan?.final_due_rule === "days_before_event" && eventResult.data?.event_date
      ? (() => { const date = new Date(`${eventResult.data.event_date}T00:00:00.000Z`); date.setUTCDate(date.getUTCDate() - Number(paymentPlan.final_due_days_before_event)); return date.toLocaleDateString("en-US", { timeZone: "UTC" }); })()
      : balanceInvoice?.due_at ? new Date(balanceInvoice.due_at).toLocaleDateString("en-US", { timeZone: "UTC" }) : null;

    const tokenOverrides = buildContractTokenOverrides({
      clientFullName: portalAccess?.clientName,
      clientAddress,
      clientEmail,
      companyAddress: companyProfile?.address,
      companyDbaName: companyProfile?.dbaName,
      companyEmail: companyProfile?.email,
      companyLegalName: companyProfile?.legalName,
      companyPhone: companyProfile?.phone,
      companyWebsite: companyProfile?.website,
      eventBookingType: eventResult.data?.booking_type,
      eventDate: eventResult.data?.event_date ?? portalAccess?.eventDate ?? null,
      eventDateFull: eventResult.data?.event_date ? new Date(eventResult.data.event_date).toLocaleDateString("en-US", { timeZone: "UTC" }) : portalAccess?.eventDate ?? null,
      eventGuestCount: eventResult.data?.guest_count,
      eventName: eventResult.data?.event_name,
      eventServiceEndTime: eventResult.data?.service_end_time,
      eventServiceLocation: eventResult.data?.service_location_description,
      eventServiceStartTime: eventResult.data?.service_start_time,
      eventType: eventResult.data?.event_type,
      displayCurrency: acceptedVersion?.display_currency,
      exchangeRateToMxn: acceptedVersion?.exchange_rate_to_mxn,
      financials: {
        balanceDueDate,
        balanceMxn: balanceInvoice?.total_mxn,
        balanceUsd: balanceInvoice?.total_mxn && acceptedVersion?.exchange_rate_to_mxn ? balanceInvoice.total_mxn / acceptedVersion.exchange_rate_to_mxn : null,
        retainerMxn: retainerInvoice?.total_mxn,
        retainerUsd: retainerInvoice?.total_mxn && acceptedVersion?.exchange_rate_to_mxn ? retainerInvoice.total_mxn / acceptedVersion.exchange_rate_to_mxn : null,
        subtotal: acceptedVersion?.subtotal_mxn,
        tax: acceptedVersion?.tax_total_mxn,
        total: acceptedVersion?.total_mxn,
      },
      paymentPlan: { balanceDueDate, finalPaymentPercent: paymentPlan?.final_payment_percent, retainerPercent: paymentPlan?.retainer_percent },
      items: acceptedItems.map((item) => ({ description: item.description, details: item.details, quantity: item.quantity, totalMxn: item.line_total_mxn, unitPriceMxn: item.unit_price_mxn })),
      signerFullName: signingProfile?.authorizedSignerFullName,
      signerTitle: signingProfile?.authorizedSignerTitle,
      venueName: portalAccess?.venueName,
    });

    return {
      filename: buildDocumentFilename("contract", contract.contractId),
      pdf: Uint8Array.from(
        await createContractPdfDocument({
          body: resolveContractExportBody({
            contractBody: resolvedBody,
            templateBody: "",
          }),
          clientName: portalAccess?.clientName,
          clientAddress: portalAccess?.clientAddress,
          contractId: contract.contractId,
          companyProfile,
          issuedAt: portalAccess?.eventDate ?? contract.issuedAt,
          signerFullName: signingProfile?.authorizedSignerFullName || undefined,
          signerTitle: signingProfile?.authorizedSignerTitle || undefined,
          status: contract.status,
          title: contract.title,
          tokenOverrides,
          auditTrail: Array.isArray(contractData.auditTrail) ? contractData.auditTrail as Array<{ at: string; event: string; source?: string }> : [],
          signingMetadata: typeof contractData.signingMetadata === "object" && contractData.signingMetadata
            ? contractData.signingMetadata as { authenticationMethod?: string; documentHash?: string; ipAddress?: string | null; signedAt?: string; userAgent?: string | null }
            : undefined,
          venueName: portalAccess?.venueName || undefined,
        }),
      ),
    };
  }

  const questionnaires = await listPublicPortalQuestionnaires(database, accessKey);
  const questionnaire = questionnaires.find((item) => item.id === documentId);
  if (!questionnaire || !questionnaire.hasBeenViewed || !canDownloadQuestionnaire(questionnaire)) {
    return null;
  }

  return {
    filename: buildDocumentFilename("questionnaire", questionnaire.id),
    pdf: Uint8Array.from(
      await createQuestionnairePdfDocument({
        responseData: questionnaire.responseData,
        submittedAt: questionnaire.submittedAt,
        title: questionnaire.title,
      }),
    ),
  };
}
