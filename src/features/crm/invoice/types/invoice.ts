export type InvoiceStatus =
  | "draft"
  | "issued"
  | "payment_promised"
  | "paid"
  | "void";

export type InvoiceType = "omds_client_invoice" | "pv_internal_factura";

export type InvoiceAction = "promise" | "pay" | "void";

export type InvoiceCreateInput = {
  amountMxn: string;
  dueAt: string | null;
  isTaxable: boolean;
  notes: string;
  title: string;
};

export type InvoiceItem = {
  description: string;
  details: string;
  id: string;
  isTaxable: boolean;
  lineTotalMxn: string;
  quantity: string;
  sortOrder: number;
  unitPriceMxn: string;
};

export type Invoice = {
  clientVisible: boolean;
  contractId: string | null;
  displayCurrency: "mxn" | "usd" | "cad";
  dueAt: string | null;
  eventId: string;
  id: string;
  invoiceType: InvoiceType;
  installmentKey: "balance" | "retainer" | "single";
  issuedAt: string | null;
  items: InvoiceItem[];
  paidAt: string | null;
  paymentPromisedAt: string | null;
  quoteVersionId: string | null;
  status: InvoiceStatus;
  subtotalMxn: string;
  taxTotalMxn: string;
  totalMxn: string;
};
