import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { syncClientPortalAccess } from "../../portal/repositories/client-portal-repository";
import type { QuoteWorkflowAction } from "../types/quote";
import { calculateQuoteTotals } from "./quote-calculations";

type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
type VersionRow = Database["public"]["Tables"]["quote_versions"]["Row"];
type ItemRow = Database["public"]["Tables"]["quote_items"]["Row"];

const standardExpiryMs = 14 * 24 * 60 * 60 * 1000;

export async function applyQuoteWorkflowAction(
  database: SupabaseClient<Database>,
  eventId: string,
  quoteId: string,
  action: QuoteWorkflowAction,
) {
  if (action === "revise") return createQuoteRevision(database, quoteId);

  const quote = await findQuote(database, eventId, quoteId);
  const version = await findCurrentVersion(database, quote.id);
  const now = new Date().toISOString();

  if (action === "send") {
    await updateQuoteAndVersion(database, quote.id, version.id, "sent", {
      sent_at: now,
    });
    await database.from("events").update({ booking_status: "proposal_sent" }).eq("id", eventId);
    await syncClientPortalAccess(database, eventId);
    return;
  }

  if (action === "accept") {
    await database
      .from("quotes")
      .update({ accepted_version_id: null, status: "declined" })
      .eq("event_id", eventId)
      .neq("id", quote.id);
    await database
      .from("quotes")
      .update({ accepted_version_id: version.id, status: "accepted" })
      .eq("id", quote.id);
    await database
      .from("quote_versions")
      .update({ accepted_at: now, status: "accepted" })
      .eq("id", version.id);
    await database.from("events").update({ booking_status: "tentative_hold" }).eq("id", eventId);
    await syncClientPortalAccess(database, eventId);
    return;
  }

  const status = action === "decline" ? "declined" : "expired";
  await updateQuoteAndVersion(database, quote.id, version.id, status, {});
  await syncClientPortalAccess(database, eventId);
}

async function createQuoteRevision(
  database: SupabaseClient<Database>,
  quoteId: string,
) {
  const quote = await database.from("quotes").select("*").eq("id", quoteId).single();
  if (quote.error) throw quote.error;

  const current = await findCurrentVersion(database, quote.data.id);
  const items = await database
    .from("quote_items")
    .select("*")
    .eq("quote_version_id", current.id)
    .order("sort_order");
  if (items.error) throw items.error;

  const supersede = await database
    .from("quote_versions")
    .update({ status: "superseded" })
    .eq("id", current.id);
  if (supersede.error) throw supersede.error;

  const next = await database
    .from("quote_versions")
    .insert(toRevisionInsert(current))
    .select("*")
    .single();
  if (next.error) throw next.error;

  if (items.data.length) {
    const insert = await database
      .from("quote_items")
      .insert(items.data.map((item) => toItemInsert(item, next.data.id)));
    if (insert.error) throw insert.error;
  }

  await database.from("quotes").update({ status: "draft" }).eq("id", quoteId);
  await recalculateQuoteVersion(database, next.data, items.data);
  await syncClientPortalAccess(database, quote.data.event_id);
}

async function findQuote(
  database: SupabaseClient<Database>,
  eventId: string,
  quoteId: string,
): Promise<QuoteRow> {
  const quote = await database
    .from("quotes")
    .select("*")
    .eq("event_id", eventId)
    .eq("id", quoteId)
    .single();
  if (quote.error) throw quote.error;
  return quote.data;
}

async function findCurrentVersion(
  database: SupabaseClient<Database>,
  quoteId: string,
): Promise<VersionRow> {
  const version = await database
    .from("quote_versions")
    .select("*")
    .eq("quote_id", quoteId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  if (version.error) throw version.error;
  return version.data;
}

async function updateQuoteAndVersion(
  database: SupabaseClient<Database>,
  quoteId: string,
  versionId: string,
  status: "declined" | "expired" | "sent",
  versionValues: Partial<VersionRow>,
) {
  const [quoteUpdate, versionUpdate] = await Promise.all([
    database.from("quotes").update({ status }).eq("id", quoteId),
    database.from("quote_versions").update({ ...versionValues, status }).eq("id", versionId),
  ]);
  if (quoteUpdate.error) throw quoteUpdate.error;
  if (versionUpdate.error) throw versionUpdate.error;
}

function toRevisionInsert(version: VersionRow) {
  return {
    apply_exchange_rate_margin: version.apply_exchange_rate_margin,
    applies_isr_retention: version.applies_isr_retention,
    applies_iva_retention: version.applies_iva_retention,
    applies_iva_tax: version.applies_iva_tax,
    contract_template_key: version.contract_template_key,
    discount_type: version.discount_type,
    discount_value_mxn: version.discount_value_mxn,
    display_currency: version.display_currency,
    exchange_rate_margin_percent: version.exchange_rate_margin_percent,
    exchange_rate_to_mxn: version.exchange_rate_to_mxn,
    expires_at: new Date(Date.now() + standardExpiryMs).toISOString(),
    isr_retention_rate_percent: version.isr_retention_rate_percent,
    iva_retention_rate_percent: version.iva_retention_rate_percent,
    payment_plan_id: version.payment_plan_id,
    questionnaire_template_key: version.questionnaire_template_key,
    quote_id: version.quote_id,
    tax_rate_percent: version.tax_rate_percent,
    version_number: version.version_number + 1,
  };
}

function toItemInsert(item: ItemRow, quoteVersionId: string) {
  return {
    cog_mxn: item.cog_mxn,
    description: item.description,
    details: item.details,
    is_taxable: item.is_taxable,
    line_total_mxn: item.line_total_mxn,
    product_id: item.product_id,
    quantity: item.quantity,
    quote_version_id: quoteVersionId,
    sort_order: item.sort_order,
    unit_price_mxn: item.unit_price_mxn,
  };
}

async function recalculateQuoteVersion(
  database: SupabaseClient<Database>,
  version: VersionRow,
  sourceItems: ItemRow[],
) {
  const items = sourceItems.map((item) => ({ ...item, quote_version_id: version.id }));
  const totals = calculateQuoteTotals(version, items);
  const update = await database.from("quote_versions").update(totals).eq("id", version.id);
  if (update.error) throw update.error;
}
