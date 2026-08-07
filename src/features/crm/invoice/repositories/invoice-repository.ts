import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { syncClientPortalAccess } from "../../portal/repositories/client-portal-repository";
import { createInvoicesFromAcceptedQuotePlan } from "./invoice-installments";
import type {
  Invoice,
  InvoiceCreateInput,
  InvoiceItem,
  InvoiceStatus,
  InvoiceType,
} from "../types/invoice";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceItemRow = Database["public"]["Tables"]["invoice_items"]["Row"];
type QuoteVersionRow = Database["public"]["Tables"]["quote_versions"]["Row"];
type QuoteItemRow = Database["public"]["Tables"]["quote_items"]["Row"];

const money = (value: number) => Number(value).toFixed(2);

const mapItem = (item: InvoiceItemRow): InvoiceItem => ({
  description: item.description,
  details: item.details,
  id: item.id,
  isTaxable: item.is_taxable,
  lineTotalMxn: money(item.line_total_mxn),
  quantity: money(item.quantity),
  sortOrder: item.sort_order,
  unitPriceMxn: money(item.unit_price_mxn),
});

const mapInvoice = (invoice: InvoiceRow, items: InvoiceItemRow[]): Invoice => ({
  clientVisible: invoice.client_visible,
  contractId: invoice.contract_id,
  displayCurrency: invoice.display_currency as Invoice["displayCurrency"],
  dueAt: invoice.due_at,
  eventId: invoice.event_id,
  id: invoice.id,
  invoiceType: invoice.invoice_type as InvoiceType,
  installmentKey: invoice.installment_key as Invoice["installmentKey"],
  issuedAt: invoice.issued_at,
  items: items.map(mapItem),
  paidAt: invoice.paid_at,
  paymentPromisedAt: invoice.payment_promised_at,
  quoteVersionId: invoice.quote_version_id,
  status: invoice.status as InvoiceStatus,
  subtotalMxn: money(invoice.subtotal_mxn),
  taxTotalMxn: money(invoice.tax_total_mxn),
  totalMxn: money(invoice.total_mxn),
});

export async function listInvoices(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const invoices = await database
    .from("invoices")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (invoices.error) throw invoices.error;
  if (!invoices.data.length) return [];

  const items = await database
    .from("invoice_items")
    .select("*")
    .in("invoice_id", invoices.data.map((invoice) => invoice.id))
    .order("sort_order");
  if (items.error) throw items.error;

  return invoices.data.map((invoice) =>
    mapInvoice(
      invoice,
      items.data.filter((item) => item.invoice_id === invoice.id),
    ),
  );
}

export async function createAdHocInvoice(
  database: SupabaseClient<Database>,
  eventId: string,
  input: InvoiceCreateInput,
) {
  const parsedAmount = Number(input.amountMxn);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error("invoice_invalid_amount");
  }

  const event = await database
    .from("events")
    .select("booking_type")
    .eq("id", eventId)
    .single();
  if (event.error) throw event.error;

  const invoiceType: InvoiceType =
    event.data.booking_type === "preferred_vendor"
      ? "pv_internal_factura"
      : "omds_client_invoice";

  const roundedAmount = Number(parsedAmount.toFixed(2));
  const invoiceInsert = await database
    .from("invoices")
    .insert({
      client_visible: invoiceType === "omds_client_invoice",
      due_at: input.dueAt,
      event_id: eventId,
      installment_key: "single",
      invoice_type: invoiceType,
      issued_at: new Date().toISOString(),
      status: "issued",
      subtotal_mxn: roundedAmount,
      tax_total_mxn: 0,
      total_mxn: roundedAmount,
    })
    .select("*")
    .single();
  if (invoiceInsert.error) throw invoiceInsert.error;

  const itemInsert = await database
    .from("invoice_items")
    .insert({
      description: input.title,
      details: input.notes,
      invoice_id: invoiceInsert.data.id,
      is_taxable: input.isTaxable,
      line_total_mxn: roundedAmount,
      quantity: 1,
      sort_order: 1,
      unit_price_mxn: roundedAmount,
    })
    .select("*")
    .single();
  if (itemInsert.error) throw itemInsert.error;

  await syncClientPortalAccess(database, eventId);
  return mapInvoice(invoiceInsert.data, [itemInsert.data]);
}

export async function createInvoiceFromAcceptedQuote(
  database: SupabaseClient<Database>,
  eventId: string,
  contractId: string,
) {
  const event = await database
    .from("events")
    .select("booking_type,event_date")
    .eq("id", eventId)
    .single();
  if (event.error) throw event.error;

  const version = await findAcceptedVersion(database, eventId);
  if (!version) return null;

  const invoiceType =
    event.data.booking_type === "preferred_vendor"
      ? "pv_internal_factura"
      : "omds_client_invoice";
  await createInvoicesFromAcceptedQuotePlan({
    contractId,
    database,
    eventDate: event.data.event_date,
    eventId,
    invoiceType,
    quoteVersion: version,
  });
  return null;
}

export async function promiseInvoicePayment(
  database: SupabaseClient<Database>,
  invoiceId: string,
) {
  const result = await database
    .from("invoices")
    .update({
      payment_promised_at: new Date().toISOString(),
      status: "payment_promised",
    })
    .eq("id", invoiceId)
    .eq("invoice_type", "omds_client_invoice")
    .select("event_id")
    .single();

  if (result.error) throw result.error;
  await syncClientPortalAccess(database, result.data.event_id);
}

export async function payInvoice(
  database: SupabaseClient<Database>,
  invoiceId: string,
) {
  const invoice = await database
    .from("invoices")
    .select("event_id, invoice_type")
    .eq("id", invoiceId)
    .single();
  if (invoice.error) throw invoice.error;

  const result = await database
    .from("invoices")
    .update({ paid_at: new Date().toISOString(), status: "paid" })
    .eq("id", invoiceId);
  if (result.error) throw result.error;

  if (invoice.data.invoice_type === "omds_client_invoice") {
    const event = await database
      .from("events")
      .update({ booking_status: "confirmed" })
      .eq("id", invoice.data.event_id);
    if (event.error) throw event.error;
  }
  await syncClientPortalAccess(database, invoice.data.event_id);
}

export async function voidInvoice(
  database: SupabaseClient<Database>,
  invoiceId: string,
) {
  const result = await database
    .from("invoices")
    .update({ status: "void" })
    .eq("id", invoiceId)
    .select("event_id")
    .single();

  if (result.error) throw result.error;
  await syncClientPortalAccess(database, result.data.event_id);
}

async function findAcceptedVersion(
  database: SupabaseClient<Database>,
  eventId: string,
): Promise<QuoteVersionRow | null> {
  const quote = await database
    .from("quotes")
    .select("accepted_version_id")
    .eq("event_id", eventId)
    .eq("status", "accepted")
    .maybeSingle();
  if (quote.error) throw quote.error;
  if (!quote.data?.accepted_version_id) return null;

  const version = await database
    .from("quote_versions")
    .select("*")
    .eq("id", quote.data.accepted_version_id)
    .single();
  if (version.error) throw version.error;
  return version.data;
}
