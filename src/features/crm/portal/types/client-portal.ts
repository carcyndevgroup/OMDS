import type { Json } from "@/core/supabase/json.types";

export type ClientPortalStep =
  | "quotes"
  | "questionnaires"
  | "contracts"
  | "invoices"
  | "reviews";

export type ClientPortalAccess = {
  accessKey: string;
  contractsVisible: boolean;
  eventId: string;
  invoicesVisible: boolean;
  portalEnabled: boolean;
  questionnairesVisible: boolean;
  quotesVisible: boolean;
  reviewsVisible: boolean;
  revokedAt: string | null;
  syncedAt: string;
};

export type PublicClientPortalAccess = {
  accessKey: string;
  clientAddress: string;
  clientName: string;
  contractsVisible: boolean;
  eventDate: string;
  eventId: string;
  invoicesVisible: boolean;
  portalEnabled: boolean;
  questionnairesVisible: boolean;
  quotesVisible: boolean;
  reviewsVisible: boolean;
  venueName: string;
};

export type PublicPortalQuoteItem = {
  description: string;
  details: string;
  lineTotalMxn: string;
  quantity: string;
  sortOrder: number;
  unitPriceMxn: string;
};

export type PublicPortalQuote = {
  applyExchangeRateMargin: boolean;
  appliesIsrRetention: boolean;
  appliesIvaRetention: boolean;
  appliesIvaTax: boolean;
  displayCurrency: "cad" | "mxn" | "usd";
  exchangeRateMarginPercent: string;
  exchangeRateToMxn: string;
  expiresAt: string | null;
  hasBeenViewed: boolean;
  id: string;
  issuedAt: string | null;
  isExpired: boolean;
  items: PublicPortalQuoteItem[];
  isrRetentionMxn: string;
  ivaRetentionMxn: string;
  ivaTaxMxn: string;
  status: string;
  subtotalMxn: string;
  taxTotalMxn: string;
  title: string;
  totalMxn: string;
  versionId: string;
  versionNumber: number;
  versionStatus: string;
};

export type PublicPortalQuoteAction = "accept" | "decline";

export type PublicPortalQuestionnaire = {
  hasBeenViewed: boolean;
  id: string;
  responseData: Json;
  sentAt: string | null;
  status: "sent" | "submitted";
  submittedAt: string | null;
  templateDefinition: Json;
  templateKey: string;
  title: string;
};

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
