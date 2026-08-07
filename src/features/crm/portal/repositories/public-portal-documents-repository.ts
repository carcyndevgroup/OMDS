import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";
import type { Json } from "@/core/supabase/json.types";

export type PublicPortalContract = {
  body: string;
  contractId: string;
  hasBeenViewed: boolean;
  issuedAt: string | null;
  signedAt: string | null;
  status: "draft" | "sent" | "signed" | "void";
  templateKey: string;
  title: string;
  versionNumber: number;
};

export type PublicPortalInvoiceItem = {
  description: string;
  details: string;
  lineTotalMxn: string;
  quantity: string;
  sortOrder: number;
  unitPriceMxn: string;
};

export type PublicPortalInvoice = {
  clientVisible: boolean;
  contractId: string | null;
  displayCurrency: "mxn" | "usd" | "cad";
  dueAt: string | null;
  hasBeenViewed: boolean;
  invoiceId: string;
  invoiceType: "omds_client_invoice" | "pv_internal_factura";
  installmentKey: "balance" | "retainer" | "single";
  issuedAt: string | null;
  items: PublicPortalInvoiceItem[];
  paidAt: string | null;
  paymentPromisedAt: string | null;
  status: "draft" | "issued" | "payment_promised" | "paid" | "void";
  subtotalMxn: string;
  taxTotalMxn: string;
  totalMxn: string;
};

type PublicPortalContractRow = {
  body: string | null;
  contract_id: string;
  has_been_viewed: boolean;
  issued_at: string | null;
  signed_at: string | null;
  status: string;
  template_key: string;
  title: string;
  version_number: number;
};

type PublicPortalInvoiceJsonItem = {
  description?: unknown;
  details?: unknown;
  lineTotalMxn?: unknown;
  quantity?: unknown;
  sortOrder?: unknown;
  unitPriceMxn?: unknown;
};

type PublicPortalInvoiceRow = {
  client_visible: boolean;
  contract_id: string | null;
  display_currency: string;
  due_at: string | null;
  has_been_viewed: boolean;
  invoice_id: string;
  invoice_type: string;
  installment_key: string;
  issued_at: string | null;
  items: Json;
  paid_at: string | null;
  payment_promised_at: string | null;
  status: string;
  subtotal_mxn: number;
  tax_total_mxn: number;
  total_mxn: number;
};

const money = (value: unknown) => Number(value ?? 0).toFixed(2);

export async function listPublicPortalContracts(
  database: SupabaseClient<Database>,
  accessKey: string,
) {
  const result = await (database as SupabaseClient<any>).rpc("get_client_portal_contracts_by_key", {
    input_access_key: accessKey,
  });

  if (result.error) throw result.error;
  return (result.data as PublicPortalContractRow[]).map(mapContract);
}

export async function listPublicPortalInvoices(
  database: SupabaseClient<Database>,
  accessKey: string,
) {
  const result = await (database as SupabaseClient<any>).rpc("get_client_portal_invoices_by_key", {
    input_access_key: accessKey,
  });

  if (result.error) throw result.error;
  return (result.data as PublicPortalInvoiceRow[]).map(mapInvoice);
}

const mapContract = (row: PublicPortalContractRow): PublicPortalContract => ({
  body: row.body ?? "",
  contractId: row.contract_id,
  hasBeenViewed: row.has_been_viewed,
  issuedAt: row.issued_at,
  signedAt: row.signed_at,
  status: row.status as PublicPortalContract["status"],
  templateKey: row.template_key,
  title: row.title,
  versionNumber: row.version_number,
});

const mapInvoice = (row: PublicPortalInvoiceRow): PublicPortalInvoice => ({
  clientVisible: row.client_visible,
  contractId: row.contract_id,
  displayCurrency:
    row.display_currency === "usd" || row.display_currency === "cad"
      ? row.display_currency
      : "mxn",
  dueAt: row.due_at,
  hasBeenViewed: row.has_been_viewed,
  invoiceId: row.invoice_id,
  invoiceType:
    row.invoice_type === "pv_internal_factura"
      ? "pv_internal_factura"
      : "omds_client_invoice",
  installmentKey:
    row.installment_key === "balance" || row.installment_key === "retainer"
      ? row.installment_key
      : "single",
  issuedAt: row.issued_at,
  items: Array.isArray(row.items)
    ? row.items.map((item) => mapInvoiceItem(item as unknown as PublicPortalInvoiceJsonItem))
    : [],
  paidAt: row.paid_at,
  paymentPromisedAt: row.payment_promised_at,
  status: row.status as PublicPortalInvoice["status"],
  subtotalMxn: money(row.subtotal_mxn),
  taxTotalMxn: money(row.tax_total_mxn),
  totalMxn: money(row.total_mxn),
});

const mapInvoiceItem = (item: PublicPortalInvoiceJsonItem): PublicPortalInvoiceItem => ({
  description: typeof item.description === "string" ? item.description : "",
  details: typeof item.details === "string" ? item.details : "",
  lineTotalMxn: money(item.lineTotalMxn),
  quantity: money(item.quantity),
  sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 0,
  unitPriceMxn: money(item.unitPriceMxn),
});
