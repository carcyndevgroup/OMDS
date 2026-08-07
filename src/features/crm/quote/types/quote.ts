export type QuoteStatus =
  | "accepted"
  | "declined"
  | "draft"
  | "expired"
  | "sent"
  | "viewed";

export type QuoteVersionStatus = QuoteStatus | "superseded";

export type QuoteItem = {
  cogMxn: string;
  description: string;
  details: string;
  id: string;
  isTaxable: boolean;
  lineTotalMxn: string;
  productId: string | null;
  quantity: string;
  sortOrder: number;
  unitPriceMxn: string;
};

export type QuoteRecipient = {
  clientId: string | null;
  email: string;
  id: string;
  name: string;
};

export type QuoteVersion = {
  applyExchangeRateMargin: boolean;
  appliesIsrRetention: boolean;
  appliesIvaRetention: boolean;
  appliesIvaTax: boolean;
  discountType: "amount" | "percent";
  discountValueMxn: string;
  displayCurrency: "cad" | "mxn" | "usd";
  exchangeRateMarginPercent: string;
  exchangeRateToMxn: string;
  expiresAt: string;
  id: string;
  isrRetentionMxn: string;
  isrRetentionRatePercent: string;
  items: QuoteItem[];
  itemsTotalMxn: string;
  ivaRetentionMxn: string;
  ivaRetentionRatePercent: string;
  ivaTaxMxn: string;
  contractTemplateKey: string | null;
  paymentPlanId: string | null;
  questionnaireTemplateKey: string | null;
  sentAt: string | null;
  status: QuoteVersionStatus;
  subtotalMxn: string;
  taxRatePercent: string;
  taxTotalMxn: string;
  totalMxn: string;
  versionNumber: number;
};

export type QuoteVersionMeta = {
  id: string;
  status: QuoteVersionStatus;
  versionNumber: number;
};

export type QuoteSummary = {
  currentVersion: QuoteVersion | null;
  id: string;
  recipients: QuoteRecipient[];
  status: QuoteStatus;
  title: string;
  versions: QuoteVersionMeta[];
};

export type QuoteCreateValues = {
  title: string;
};

export type QuoteAddProductValues = {
  productId: string;
  quantity: string;
};

export type QuoteAddManualItemValues = QuoteUpdateItemValues;

export type QuoteMoveDirection = "down" | "up";

export type QuoteWorkflowAction =
  | "accept"
  | "decline"
  | "expire"
  | "revise"
  | "send";

export type QuoteUpdateItemValues = {
  cogMxn: string;
  description: string;
  details: string;
  isTaxable: boolean;
  quantity: string;
  unitPriceMxn: string;
};

export type QuoteUpdateVersionValues = {
  applyExchangeRateMargin: boolean;
  appliesIsrRetention: boolean;
  appliesIvaRetention: boolean;
  appliesIvaTax: boolean;
  discountType: "amount" | "percent";
  discountValueMxn: string;
  displayCurrency: "cad" | "mxn" | "usd";
  exchangeRateMarginPercent: string;
  exchangeRateToMxn: string;
  expiresAt: string;
  isrRetentionRatePercent: string;
  ivaRetentionRatePercent: string;
  contractTemplateKey: string | null;
  paymentPlanId: string | null;
  questionnaireTemplateKey: string | null;
  taxRatePercent: string;
};

export type QuoteRecipientValues = {
  clientId: string | null;
  email: string;
  name: string;
};
