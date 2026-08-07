import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  QuoteCreateValues,
  QuoteItem,
  QuoteRecipient,
  QuoteStatus,
  QuoteSummary,
  QuoteVersion,
  QuoteVersionStatus,
} from "../types/quote";

type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
type VersionRow = Database["public"]["Tables"]["quote_versions"]["Row"];
type ItemRow = Database["public"]["Tables"]["quote_items"]["Row"];
type RecipientRow = Database["public"]["Tables"]["quote_recipients"]["Row"];

const money = (value: number) => Number(value).toFixed(2);
const standardExpiryMs = 14 * 24 * 60 * 60 * 1000;

const mapItem = (item: ItemRow): QuoteItem => ({
  cogMxn: money(item.cog_mxn),
  description: item.description,
  details: item.details,
  id: item.id,
  isTaxable: item.is_taxable,
  lineTotalMxn: money(item.line_total_mxn),
  productId: item.product_id,
  quantity: money(item.quantity),
  sortOrder: item.sort_order,
  unitPriceMxn: money(item.unit_price_mxn),
});

const mapRecipient = (recipient: RecipientRow): QuoteRecipient => ({
  clientId: recipient.client_id,
  email: recipient.email,
  id: recipient.id,
  name: recipient.name,
});

const mapVersion = (version: VersionRow, items: ItemRow[]): QuoteVersion => ({
  applyExchangeRateMargin: version.apply_exchange_rate_margin,
  appliesIsrRetention: version.applies_isr_retention,
  appliesIvaRetention: version.applies_iva_retention,
  appliesIvaTax: version.applies_iva_tax,
  discountType: version.discount_type as QuoteVersion["discountType"],
  discountValueMxn: money(version.discount_value_mxn),
  displayCurrency: version.display_currency as QuoteVersion["displayCurrency"],
  exchangeRateMarginPercent: money(version.exchange_rate_margin_percent),
  exchangeRateToMxn: String(version.exchange_rate_to_mxn),
  expiresAt: version.expires_at ? version.expires_at.slice(0, 10) : "",
  id: version.id,
  isrRetentionMxn: money(version.isr_retention_mxn),
  isrRetentionRatePercent: String(version.isr_retention_rate_percent),
  items: items.map(mapItem),
  itemsTotalMxn: money(version.items_total_mxn),
  ivaRetentionMxn: money(version.iva_retention_mxn),
  ivaRetentionRatePercent: String(version.iva_retention_rate_percent),
  ivaTaxMxn: money(version.iva_tax_mxn),
  contractTemplateKey: version.contract_template_key,
  paymentPlanId: version.payment_plan_id,
  questionnaireTemplateKey: version.questionnaire_template_key,
  sentAt: version.sent_at,
  status: version.status as QuoteVersionStatus,
  subtotalMxn: money(version.subtotal_mxn),
  taxRatePercent: money(version.tax_rate_percent),
  taxTotalMxn: money(version.tax_total_mxn),
  totalMxn: money(version.total_mxn),
  versionNumber: version.version_number,
});

const mapQuote = (
  quote: QuoteRow,
  versions: VersionRow[],
  items: ItemRow[],
  recipients: RecipientRow[],
): QuoteSummary => {
  const current = [...versions]
    .filter((version) => version.quote_id === quote.id)
    .sort((a, b) => b.version_number - a.version_number)[0];

  return {
    currentVersion: current
      ? mapVersion(current, items.filter((item) => item.quote_version_id === current.id))
      : null,
    id: quote.id,
    recipients: recipients
      .filter((recipient) => recipient.quote_id === quote.id)
      .map(mapRecipient),
    status: quote.status as QuoteStatus,
    title: quote.title,
    versions: versions
      .filter((version) => version.quote_id === quote.id)
      .sort((a, b) => b.version_number - a.version_number)
      .map((version) => ({
        id: version.id,
        status: version.status as QuoteVersionStatus,
        versionNumber: version.version_number,
      })),
  };
};

export async function createQuote(
  database: SupabaseClient<Database>,
  eventId: string,
  values: QuoteCreateValues,
) {
  const quote = await database
    .from("quotes")
    .insert({ event_id: eventId, title: values.title.trim() })
    .select("*")
    .single();
  if (quote.error) throw quote.error;

  const version = await database
    .from("quote_versions")
    .insert({
      expires_at: new Date(Date.now() + standardExpiryMs).toISOString(),
      quote_id: quote.data.id,
      version_number: 1,
    })
    .select("*")
    .single();
  if (version.error) throw version.error;

  const primaryContact = await database
    .from("event_contacts")
    .select("client_id")
    .eq("event_id", eventId)
    .eq("is_primary", true)
    .maybeSingle();
  if (primaryContact.error) throw primaryContact.error;

  let recipients: RecipientRow[] = [];
  if (primaryContact.data?.client_id) {
    const client = await database
      .from("clients")
      .select("first_name,last_name,email")
      .eq("id", primaryContact.data.client_id)
      .single();
    if (client.error) throw client.error;

    const recipient = await database
      .from("quote_recipients")
      .insert({
        client_id: primaryContact.data.client_id,
        email: client.data.email,
        name: `${client.data.first_name} ${client.data.last_name}`.trim(),
        quote_id: quote.data.id,
      })
      .select("*")
      .single();
    if (recipient.error) throw recipient.error;
    recipients = [recipient.data];
  }

  return mapQuote(quote.data, [version.data], [], recipients);
}

export async function listEventQuotes(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const quotes = await database.from("quotes").select("*").eq("event_id", eventId).order("created_at");
  if (quotes.error) throw quotes.error;
  if (!quotes.data.length) return [];

  const quoteIds = quotes.data.map((quote) => quote.id);
  const versions = await database.from("quote_versions").select("*").in("quote_id", quoteIds);
  if (versions.error) throw versions.error;

  const versionIds = versions.data.map((version) => version.id);
  const items = versionIds.length
    ? await database.from("quote_items").select("*").in("quote_version_id", versionIds).order("sort_order")
    : { data: [], error: null };
  if (items.error) throw items.error;
  const recipients = await database
    .from("quote_recipients")
    .select("*")
    .in("quote_id", quoteIds)
    .order("created_at");
  if (recipients.error) throw recipients.error;

  return quotes.data.map((quote) =>
    mapQuote(quote, versions.data, items.data, recipients.data),
  );
}
