import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";
import type { Json } from "@/core/supabase/json.types";

import type {
  ClientPortalAccess,
  PublicClientPortalAccess,
  PublicPortalQuestionnaire,
  PublicPortalQuote,
  PublicPortalQuoteAction,
  PublicPortalQuoteItem,
} from "../types/client-portal";

type PortalRow = Database["public"]["Tables"]["client_portal_access"]["Row"];
type PublicPortalRow =
  Database["public"]["Functions"]["get_client_portal_access_by_key"]["Returns"][number];
type PublicQuoteRow =
  Database["public"]["Functions"]["get_client_portal_quotes_by_key"]["Returns"][number];
type PublicQuestionnaireRow =
  Database["public"]["Functions"]["get_client_portal_questionnaires_by_key"]["Returns"][number];
type PublicQuoteJsonItem = {
  description?: unknown;
  details?: unknown;
  lineTotalMxn?: unknown;
  quantity?: unknown;
  sortOrder?: unknown;
  unitPriceMxn?: unknown;
};

const money = (value: unknown) => Number(value ?? 0).toFixed(2);

const mapPortalAccess = (row: PortalRow): ClientPortalAccess => ({
  accessKey: row.access_key,
  contractsVisible: row.contracts_visible,
  eventId: row.event_id,
  invoicesVisible: row.invoices_visible,
  portalEnabled: row.portal_enabled,
  questionnairesVisible: row.questionnaires_visible,
  quotesVisible: row.quotes_visible,
  reviewsVisible: row.reviews_visible,
  revokedAt: row.revoked_at,
  syncedAt: row.synced_at,
});

const mapPublicPortalAccess = (
  row: PublicPortalRow,
): PublicClientPortalAccess => ({
  accessKey: row.access_key,
  clientAddress: row.client_address,
  clientName: row.client_name,
  contractsVisible: row.contracts_visible,
  eventDate: row.event_date,
  eventId: row.event_id,
  invoicesVisible: row.invoices_visible,
  portalEnabled: row.portal_enabled,
  questionnairesVisible: row.questionnaires_visible,
  quotesVisible: row.quotes_visible,
  reviewsVisible: row.reviews_visible,
  venueName: row.venue_name,
});

const mapPublicQuoteItem = (item: PublicQuoteJsonItem): PublicPortalQuoteItem => ({
  description: typeof item.description === "string" ? item.description : "",
  details: typeof item.details === "string" ? item.details : "",
  lineTotalMxn: money(item.lineTotalMxn),
  quantity: money(item.quantity),
  sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 0,
  unitPriceMxn: money(item.unitPriceMxn),
});

const mapPublicQuote = (row: PublicQuoteRow): PublicPortalQuote => ({
  applyExchangeRateMargin: row.apply_exchange_rate_margin,
  appliesIsrRetention: row.applies_isr_retention,
  appliesIvaRetention: row.applies_iva_retention,
  appliesIvaTax: row.applies_iva_tax,
  displayCurrency: row.display_currency === "usd" || row.display_currency === "cad"
    ? row.display_currency
    : "mxn",
  exchangeRateMarginPercent: money(row.exchange_rate_margin_percent),
  exchangeRateToMxn: money(row.exchange_rate_to_mxn),
  expiresAt: row.expires_at,
  hasBeenViewed: Boolean((row as { has_been_viewed?: unknown }).has_been_viewed),
  id: row.quote_id,
  issuedAt: (row as { issued_at?: string | null }).issued_at ?? null,
  isExpired: row.is_expired,
  isrRetentionMxn: money(row.isr_retention_mxn),
  items: Array.isArray(row.items)
    ? row.items.map((item) => mapPublicQuoteItem(item as PublicQuoteJsonItem))
    : [],
  ivaRetentionMxn: money(row.iva_retention_mxn),
  ivaTaxMxn: money(row.iva_tax_mxn),
  status: row.quote_status,
  subtotalMxn: money(row.subtotal_mxn),
  taxTotalMxn: money(row.tax_total_mxn),
  title: row.title,
  totalMxn: money(row.total_mxn),
  versionId: row.version_id,
  versionNumber: row.version_number,
  versionStatus: row.version_status,
});

const mapPublicQuestionnaire = (
  row: PublicQuestionnaireRow,
): PublicPortalQuestionnaire => ({
  hasBeenViewed: Boolean((row as { has_been_viewed?: unknown }).has_been_viewed),
  id: row.questionnaire_id,
  responseData: row.response_data,
  sentAt: row.sent_at,
  status: row.status === "submitted" ? "submitted" : "sent",
  submittedAt: row.submitted_at,
  templateDefinition: row.template_definition,
  templateKey: row.template_key,
  title: row.title,
});

export async function syncClientPortalAccess(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const result = await database.rpc("sync_client_portal_access", {
    target_event_id: eventId,
  });

  if (result.error) throw result.error;
  return mapPortalAccess(result.data);
}

export async function getClientPortalAccess(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  return syncClientPortalAccess(database, eventId);
}

export async function getPublicClientPortalAccess(
  database: SupabaseClient<Database>,
  accessKey: string,
) {
  const result = await database.rpc("get_client_portal_access_by_key", {
    input_access_key: accessKey,
  });

  if (result.error) throw result.error;
  return result.data[0] ? mapPublicPortalAccess(result.data[0]) : null;
}

export async function listPublicPortalQuotes(
  database: SupabaseClient<Database>,
  accessKey: string,
) {
  const result = await database.rpc("get_client_portal_quotes_by_key", {
    input_access_key: accessKey,
  });

  if (result.error) throw result.error;
  return result.data.map(mapPublicQuote);
}

export async function listPublicPortalQuestionnaires(
  database: SupabaseClient<Database>,
  accessKey: string,
) {
  const result = await database.rpc("get_client_portal_questionnaires_by_key", {
    input_access_key: accessKey,
  });

  if (result.error) throw result.error;
  return result.data.map(mapPublicQuestionnaire);
}

export async function respondPublicPortalQuote(
  database: SupabaseClient<Database>,
  accessKey: string,
  quoteId: string,
  action: PublicPortalQuoteAction,
) {
  const result = await database.rpc("respond_client_portal_quote_by_key", {
    input_access_key: accessKey,
    input_action: action,
    input_quote_id: quoteId,
  });

  if (result.error) throw result.error;
}

export async function submitPublicPortalQuestionnaire(
  database: SupabaseClient<Database>,
  accessKey: string,
  questionnaireId: string,
  responseData: Json,
) {
  const result = await database.rpc("submit_client_portal_questionnaire_by_key", {
    input_access_key: accessKey,
    input_questionnaire_id: questionnaireId,
    input_response_data: responseData,
  });

  if (result.error) throw result.error;
}

export async function savePublicPortalQuestionnaireProgress(
  database: SupabaseClient<Database>,
  accessKey: string,
  questionnaireId: string,
  responseData: Json,
) {
  const result = await database.rpc("save_client_portal_questionnaire_progress_by_key", {
    input_access_key: accessKey,
    input_questionnaire_id: questionnaireId,
    input_response_data: responseData,
  });

  if (result.error) throw result.error;
}

export async function markPublicPortalDocumentViewed(
  database: SupabaseClient<Database>,
  accessKey: string,
  documentKind: "contract" | "invoice" | "questionnaire" | "quote",
  documentId: string,
) {
  const result = await database.rpc("mark_client_portal_document_viewed_by_key", {
    input_access_key: accessKey,
    input_document_id: documentId,
    input_document_kind: documentKind,
  });

  if (result.error) throw result.error;
}
