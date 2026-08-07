import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { SatFacturaEventDefaults } from "../types/sat-factura";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type InvoiceItemRow = Database["public"]["Tables"]["invoice_items"]["Row"];
type QuoteItemRow = Database["public"]["Tables"]["quote_items"]["Row"];
type VenueRow = Database["public"]["Tables"]["venues"]["Row"];

type FacturaSource = {
  items: { description: string }[];
  quoteVersionId: string | null;
  subtotalMxn: number;
};

const money = (value: number) => value.toFixed(6);
const dateOnly = (value: string) => value ? value.slice(0, 10) : "";

export async function getSatFacturaEventDefaults(
  database: SupabaseClient<Database>,
  eventId: string,
): Promise<SatFacturaEventDefaults | null> {
  const event = await database.from("events").select("*").eq("id", eventId).maybeSingle();
  if (event.error) throw event.error;
  if (!event.data) return null;

  const [venue, source, serviceIds] = await Promise.all([
    loadPaymentVenue(database, event.data),
    loadFacturaSource(database, eventId),
    loadServiceIds(database, eventId),
  ]);

  const sourceTotal = source?.subtotalMxn ?? 0;
  const commission = calculateCommission(sourceTotal, venue);
  const subtotal = Math.max(sourceTotal - commission, 0);
  const iva = subtotal * (Number(venue?.fiscal_iva_rate ?? 16) / 100);
  const ivaRetention = venue?.fiscal_retains_iva
    ? subtotal * (Number(venue.fiscal_iva_retention_rate) / 100)
    : 0;
  const isrRetention = venue?.fiscal_retains_isr
    ? subtotal * (Number(venue.fiscal_isr_retention_rate) / 100)
    : 0;
  const total = subtotal + iva - ivaRetention - isrRetention;

  return {
    accountantRequestText: accountantRequest(event.data, venue, source?.items ?? [], subtotal),
    bankAccountId: venue?.fiscal_default_bank_account_id ?? "",
    cfdiUse: venue?.fiscal_cfdi_use ?? "",
    dueAt: dueDate(event.data.event_date, venue),
    fiscalProfileId: venue?.fiscal_default_profile_id ?? "",
    ivaMxn: money(iva),
    ivaRetentionMxn: money(ivaRetention),
    isrRetentionMxn: money(isrRetention),
    pax: String(event.data.guest_count),
    paymentForm: venue?.fiscal_payment_form ?? "",
    paymentMethod: venue?.fiscal_payment_method ?? "",
    quoteItemDescriptions: source?.items.map((item) => item.description) ?? [],
    recipientName: venue?.fiscal_legal_name || venue?.name || event.data.venue_name,
    recipientType: "venue_hotel",
    rfc: venue?.fiscal_rfc ?? "",
    serviceIds,
    serviceDescription: serviceDescription(source?.items ?? []),
    sourceTotalMxn: money(sourceTotal),
    subtotalMxn: money(subtotal),
    taxObject: venue?.fiscal_tax_object ?? "",
    taxRegime: venue?.fiscal_tax_regime ?? "",
    totalMxn: money(total),
    unitValueMxn: event.data.guest_count > 0 ? money(subtotal / event.data.guest_count) : money(0),
  };
}

async function loadPaymentVenue(database: SupabaseClient<Database>, event: EventRow) {
  const venueId = event.payment_partner_venue_id ?? event.venue_id;
  if (!venueId) return null;

  const result = await database.from("venues").select("*").eq("id", venueId).maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}

async function loadFacturaSource(
  database: SupabaseClient<Database>,
  eventId: string,
): Promise<FacturaSource | null> {
  return await loadAcceptedQuote(database, eventId)
    ?? await loadInternalInvoice(database, eventId);
}

async function loadAcceptedQuote(
  database: SupabaseClient<Database>,
  eventId: string,
): Promise<FacturaSource | null> {
  const quote = await database
    .from("quotes")
    .select("accepted_version_id")
    .eq("event_id", eventId)
    .eq("status", "accepted")
    .maybeSingle();
  if (quote.error) throw quote.error;
  if (!quote.data?.accepted_version_id) return null;

  const [version, items] = await Promise.all([
    database.from("quote_versions").select("*").eq("id", quote.data.accepted_version_id).single(),
    database.from("quote_items").select("*").eq("quote_version_id", quote.data.accepted_version_id).order("sort_order"),
  ]);

  if (version.error) throw version.error;
  if (items.error) throw items.error;
  return {
    items: items.data,
    quoteVersionId: version.data.id,
    subtotalMxn: Number(version.data.subtotal_mxn ?? 0),
  };
}

async function loadInternalInvoice(
  database: SupabaseClient<Database>,
  eventId: string,
): Promise<FacturaSource | null> {
  const invoice = await database
    .from("invoices")
    .select("id, quote_version_id, subtotal_mxn")
    .eq("event_id", eventId)
    .neq("status", "void")
    .order("invoice_type", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (invoice.error) throw invoice.error;
  if (!invoice.data) return null;

  const items = await database
    .from("invoice_items")
    .select("description")
    .eq("invoice_id", invoice.data.id)
    .order("sort_order");

  if (items.error) throw items.error;

  return {
    items: invoiceItems(items.data),
    quoteVersionId: invoice.data.quote_version_id,
    subtotalMxn: Number(invoice.data.subtotal_mxn ?? 0),
  };
}

async function loadServiceIds(database: SupabaseClient<Database>, eventId: string) {
  const result = await database.from("event_services").select("service_id").eq("event_id", eventId);
  if (result.error) throw result.error;
  return result.data.map((service) => service.service_id);
}

function calculateCommission(source: number, venue: VenueRow | null) {
  if (!venue) return 0;
  if (venue.commission_model === "fixed_percentage") {
    return source * (Number(venue.commission_percentage ?? 0) / 100);
  }
  if (venue.commission_model === "fixed_amount") {
    return Number(venue.commission_fixed_amount ?? 0);
  }
  return 0;
}

function dueDate(eventDate: string, venue: VenueRow | null) {
  if (!venue || venue.fiscal_due_rule === "manual") return "";
  if (venue.fiscal_due_rule === "same_day") return eventDate;
  if (venue.fiscal_due_rule === "next_day") {
    const date = new Date(`${eventDate}T00:00:00`);
    date.setDate(date.getDate() + 1);
    return dateOnly(date.toISOString());
  }

  const date = new Date(`${eventDate}T00:00:00`);
  const day = Math.min(venue.fiscal_due_day ?? 1, 28);
  return dateOnly(new Date(date.getFullYear(), date.getMonth(), day).toISOString());
}

function invoiceItems(items: Pick<InvoiceItemRow, "description">[]) {
  return items.map((item) => ({ description: item.description }));
}

function serviceDescription(items: Pick<QuoteItemRow, "description">[]) {
  return items.map((item) => item.description).filter(Boolean).join(" + ");
}

function accountantRequest(
  event: EventRow,
  venue: VenueRow | null,
  items: { description: string }[],
  subtotal: number,
) {
  return [
    "RFC EMISOR:",
    "NOMBRE EMISOR:",
    `RFC RECEPTOR: ${venue?.fiscal_rfc ?? ""}`,
    `NOMBRE RECEPTOR: ${venue?.fiscal_legal_name || venue?.name || ""}`,
    `NOVIOS: ${event.event_name || ""}`,
    `HOTEL: ${event.venue_name}`,
    `FECHA: ${event.event_date}`,
    `SERVICIO: ${serviceDescription(items)}`,
    `PAX: ${event.guest_count}`,
    `SUBTOTAL: ${money(subtotal)} + IVA, CON RETENCIONES`,
  ].join("\n");
}
