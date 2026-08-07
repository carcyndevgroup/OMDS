import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { resolveContractExportBody } from "@/features/crm/shared/documents/contract-export-body";
import { buildContractTokenOverrides } from "@/features/crm/shared/documents/contract-token-resolver";
import { buildDocumentFilename } from "@/features/crm/shared/documents/document-identifiers";
import { createContractPdfDocument } from "@/features/crm/shared/pdf/document-pdf";
import { DIRECT_CONTRACT_DEFAULT_BODY, PV_CONTRACT_DEFAULT_BODY } from "@/features/settings/contract-template/repositories/contract-template-defaults";
import { getCompanyProfile } from "@/features/settings/company-profile/repositories/company-profile-repository";
import { getSigningProfile } from "@/features/settings/signing-profile/repositories/signing-profile-repository";

function getCodeFallbackBody(templateKey: string | null, bookingType?: string | null) {
  if (templateKey === "direct_contract") return DIRECT_CONTRACT_DEFAULT_BODY;
  if (templateKey === "pv_service_terms") return PV_CONTRACT_DEFAULT_BODY;
  // If template_key is null, fall back based on booking type
  if (bookingType === "preferred_vendor") return PV_CONTRACT_DEFAULT_BODY;
  return DIRECT_CONTRACT_DEFAULT_BODY; // safe default for all other cases
}

type ContractPdfRouteContext = {
  params: { contractId: string; eventId: string };
};

export async function GET(request: Request, { params }: ContractPdfRouteContext) {
  const database = await createServerSupabaseClient();
  const {
    data: { user },
  } = await database.auth.getUser();

  if (!user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const contractResult = await database
    .from("contracts")
    .select("id,event_id,title,status,sent_at,created_at,template_key,contract_data")
    .eq("event_id", params.eventId)
    .eq("id", params.contractId)
    .maybeSingle();

  if (contractResult.error) throw contractResult.error;
  if (!contractResult.data) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const templateResult = await database
    .from("contract_templates")
    .select("body")
    .eq("template_key", contractResult.data.template_key)
    .maybeSingle();

  if (templateResult.error) throw templateResult.error;

  const templateBody = templateResult.data?.body?.trim() ?? "";
  const contractBody =
    typeof (contractResult.data.contract_data as Record<string, unknown> | null)?.body === "string"
      ? String((contractResult.data.contract_data as Record<string, unknown>).body)
      : "";
  const contractData = contractResult.data.contract_data && typeof contractResult.data.contract_data === "object" && !Array.isArray(contractResult.data.contract_data)
    ? contractResult.data.contract_data as Record<string, unknown>
    : {};
  const auditTrail = Array.isArray(contractData.auditTrail)
    ? contractData.auditTrail.filter((entry): entry is { at: string; event: string; source?: string } => Boolean(entry && typeof entry === "object" && typeof (entry as Record<string, unknown>).at === "string" && typeof (entry as Record<string, unknown>).event === "string"))
    : [];
  const lifecycleAudit = [
    contractResult.data.created_at ? { at: contractResult.data.created_at, event: "contract_created", source: "system" } : null,
    contractResult.data.sent_at ? { at: contractResult.data.sent_at, event: "contract_sent", source: "system" } : null,
    ...auditTrail,
  ].filter((entry): entry is { at: string; event: string; source?: string } => Boolean(entry));
  const resolvedDbBody = resolveContractExportBody({ contractBody, templateBody });

  // Fetch supporting data for token substitution and cover page in parallel.
  const [companyProfile, signingProfile, contactResult, eventResult] = await Promise.all([
    getCompanyProfile(database),
    getSigningProfile(database),
    database
      .from("event_contacts")
      .select("client_id")
      .eq("event_id", params.eventId)
      .order("is_primary", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Fetch the venue name from the event row first, then fall back to the venues table
    // to avoid FK-join failures while still keeping the PDF populated.
    database
      .from("events")
      .select("booking_type,event_date,event_name,event_type,guest_count,service_start_time,service_end_time,service_location_description,venue_id,venue_name")
      .eq("id", params.eventId)
      .maybeSingle(),
  ]);

  let clientFullName: string | null = null;
  let clientAddress: string | null = null;

  if (contactResult.data?.client_id) {
    const clientResult = await database
      .from("clients")
      .select("first_name,last_name,street_address,city,state_province,country")
      .eq("id", contactResult.data.client_id)
      .maybeSingle();

    if (clientResult.data) {
      const c = clientResult.data;
      clientFullName = `${c.first_name} ${c.last_name}`.trim();
      clientAddress = [c.street_address, c.city, c.state_province, c.country]
        .filter(Boolean)
        .join(", ");
    }
  }

  // Prefer the event's stored venue_name, then fall back to the venues table.
  let venueName: string | null = eventResult.data?.venue_name ?? null;
  const venueId = eventResult.data?.venue_id ?? null;
  if (!venueName && venueId) {
    const venueResult = await database
      .from("venues")
      .select("name")
      .eq("id", venueId)
      .maybeSingle();
    venueName = venueResult.data?.name ?? null;
  }

  const bookingType = eventResult.data?.booking_type ?? null;

  const [acceptedQuoteResult, invoiceResult] = await Promise.all([
    database
      .from("quotes")
      .select("accepted_version_id")
      .eq("event_id", params.eventId)
      .eq("status", "accepted")
      .maybeSingle(),
    database
      .from("invoices")
      .select("installment_key,total_mxn,due_at")
      .eq("event_id", params.eventId)
      .neq("status", "void"),
  ]);

  if (acceptedQuoteResult.error) throw acceptedQuoteResult.error;
  if (invoiceResult.error) throw invoiceResult.error;

  let acceptedVersion: {
    payment_plan_id: string | null;
    display_currency: string;
    exchange_rate_to_mxn: number;
    subtotal_mxn: number;
    tax_total_mxn: number;
    total_mxn: number;
  } | null = null;
  let acceptedItems: Array<{
    description: string;
    details: string;
    quantity: number;
    line_total_mxn: number;
    unit_price_mxn: number;
  }> = [];

  const acceptedVersionId = acceptedQuoteResult.data?.accepted_version_id;
  if (acceptedVersionId) {
    const [versionResult, itemsResult] = await Promise.all([
      database
        .from("quote_versions")
        .select("payment_plan_id,display_currency,exchange_rate_to_mxn,subtotal_mxn,tax_total_mxn,total_mxn")
        .eq("id", acceptedVersionId)
        .maybeSingle(),
      database
        .from("quote_items")
        .select("description,details,quantity,line_total_mxn,unit_price_mxn")
        .eq("quote_version_id", acceptedVersionId)
        .order("sort_order", { ascending: true }),
    ]);

    if (versionResult.error) throw versionResult.error;
    if (itemsResult.error) throw itemsResult.error;
    acceptedVersion = versionResult.data;
    acceptedItems = itemsResult.data ?? [];
  }

  const retainerInvoice = invoiceResult.data?.find((invoice) => invoice.installment_key === "retainer");
  const balanceInvoice = invoiceResult.data?.find((invoice) => invoice.installment_key === "balance");
  const paymentPlanResult = acceptedVersion
    ? await database
      .from("payment_plans")
      .select("final_due_rule,final_due_days_before_event,final_payment_percent,retainer_percent")
      .eq(acceptedVersion.payment_plan_id ? "id" : "is_default", acceptedVersion.payment_plan_id || true)
      .maybeSingle()
    : { data: null, error: null };
  if (paymentPlanResult.error) throw paymentPlanResult.error;
  const paymentPlan = paymentPlanResult.data;
  const calculatedBalanceDueDate = paymentPlan?.final_due_rule === "days_before_event" && eventResult.data?.event_date
    ? (() => {
        const date = new Date(`${eventResult.data.event_date}T00:00:00.000Z`);
        date.setUTCDate(date.getUTCDate() - Number(paymentPlan.final_due_days_before_event));
        return date.toLocaleDateString("en-US", { timeZone: "UTC" });
      })()
    : null;

  // Fall back to code-level default when DB body is empty (null template_key or migration pending).
  const body = resolvedDbBody || getCodeFallbackBody(contractResult.data.template_key, bookingType);

  const tokenOverrides = buildContractTokenOverrides({
    clientAddress,
    clientEmail: undefined,
    clientFullName,
    clientPhone: undefined,
    companyAddress: companyProfile?.address,
    companyDbaName: companyProfile?.dbaName,
    companyEmail: companyProfile?.email,
    companyLegalName: companyProfile?.legalName,
    companyPhone: companyProfile?.phone,
    companyWebsite: companyProfile?.website,
    eventBookingType: eventResult.data?.booking_type ?? null,
    eventDate: eventResult.data?.event_date ? new Date(eventResult.data.event_date).toISOString().slice(0, 10) : null,
    eventDateFull: eventResult.data?.event_date ? new Date(eventResult.data.event_date).toLocaleDateString("en-US", { timeZone: "UTC" }) : null,
    eventGuestCount: eventResult.data?.guest_count,
    eventName: eventResult.data?.event_name,
    eventServiceEndTime: eventResult.data?.service_end_time,
    eventServiceLocation: eventResult.data?.service_location_description,
    eventServiceStartTime: eventResult.data?.service_start_time,
    eventType: eventResult.data?.event_type,
    exchangeRateToMxn: acceptedVersion?.exchange_rate_to_mxn,
    displayCurrency: acceptedVersion?.display_currency,
    financials: {
      balanceDueDate: balanceInvoice?.due_at ? new Date(balanceInvoice.due_at).toLocaleDateString("en-US", { timeZone: "UTC" }) : null,
      balanceMxn: balanceInvoice?.total_mxn,
      balanceUsd: balanceInvoice?.total_mxn && acceptedVersion?.exchange_rate_to_mxn
        ? balanceInvoice.total_mxn / acceptedVersion.exchange_rate_to_mxn
        : null,
      retainerMxn: retainerInvoice?.total_mxn,
      retainerUsd: retainerInvoice?.total_mxn && acceptedVersion?.exchange_rate_to_mxn
        ? retainerInvoice.total_mxn / acceptedVersion.exchange_rate_to_mxn
        : null,
      subtotal: acceptedVersion?.subtotal_mxn,
      tax: acceptedVersion?.tax_total_mxn,
      total: acceptedVersion?.total_mxn,
    },
    paymentPlan: {
      balanceDueDate: calculatedBalanceDueDate,
      finalPaymentPercent: paymentPlan?.final_payment_percent,
      retainerPercent: paymentPlan?.retainer_percent,
    },
    items: acceptedItems.map((item) => ({
      description: item.description,
      details: item.details,
      quantity: item.quantity,
      totalMxn: item.line_total_mxn,
      unitPriceMxn: item.unit_price_mxn,
    })),
    signerFullName: signingProfile?.authorizedSignerFullName,
    signerTitle: signingProfile?.authorizedSignerTitle,
    venueAddress: null,
    venueContactName: null,
    venueContactPhone: null,
    venueName,
  });

  const bytes = await createContractPdfDocument({
    body,
    clientAddress,
    clientName: clientFullName,
    contractId: params.contractId,
    companyProfile,
    // Use the actual event date so the cover page shows the right date.
    issuedAt: eventResult.data?.event_date ?? contractResult.data.sent_at ?? contractResult.data.created_at,
    signerFullName: signingProfile?.authorizedSignerFullName || undefined,
    signerTitle: signingProfile?.authorizedSignerTitle || undefined,
    status: contractResult.data.status,
    title: contractResult.data.title,
    tokenOverrides,
    auditTrail: lifecycleAudit,
    signingMetadata: typeof contractData.signingMetadata === "object" && contractData.signingMetadata
      ? contractData.signingMetadata as { authenticationMethod?: string; documentHash?: string; ipAddress?: string | null; signedAt?: string; userAgent?: string | null }
      : undefined,
    venueName,
  });

  const normalizedBytes = Uint8Array.from(bytes);
  const responseBody = new Blob([normalizedBytes.buffer], { type: "application/pdf" });
  const filename = buildDocumentFilename("contract", params.contractId);

  const inline = new URL(request.url).searchParams.get("inline") === "1";

  return new NextResponse(responseBody, {
    headers: {
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename=\"${filename}\"`,
      "Content-Type": "application/pdf",
    },
    status: 200,
  });
}
