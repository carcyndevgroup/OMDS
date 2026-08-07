import type { TranslationKey } from "@/core/i18n";

import type {
  QuoteAddManualItemValues,
  QuoteAddProductValues,
  QuoteCreateValues,
  QuoteRecipientValues,
  QuoteUpdateItemValues,
  QuoteUpdateVersionValues,
} from "../types/quote";

export type QuoteCreateErrors = Partial<Record<keyof QuoteCreateValues, TranslationKey>>;
export type QuoteManualItemErrors = Partial<Record<keyof QuoteAddManualItemValues, TranslationKey>>;
export type QuoteProductErrors = Partial<Record<keyof QuoteAddProductValues, TranslationKey>>;
export type QuoteItemErrors = Partial<Record<keyof QuoteUpdateItemValues, TranslationKey>>;
export type QuoteVersionErrors = Partial<Record<keyof QuoteUpdateVersionValues, TranslationKey>>;
export type QuoteRecipientErrors = Partial<Record<keyof QuoteRecipientValues, TranslationKey>>;

export const initialQuoteCreateValues: QuoteCreateValues = { title: "" };
export const initialQuoteAddProductValues: QuoteAddProductValues = {
  productId: "",
  quantity: "1",
};
export const initialQuoteUpdateItemValues: QuoteUpdateItemValues = {
  cogMxn: "0.00",
  description: "",
  details: "",
  isTaxable: true,
  quantity: "1",
  unitPriceMxn: "0.00",
};
export const initialQuoteUpdateVersionValues: QuoteUpdateVersionValues = {
  applyExchangeRateMargin: false,
  appliesIsrRetention: false,
  appliesIvaRetention: false,
  appliesIvaTax: true,
  discountType: "amount",
  discountValueMxn: "0.00",
  displayCurrency: "mxn",
  exchangeRateMarginPercent: "3.50",
  exchangeRateToMxn: "1",
  expiresAt: "",
  isrRetentionRatePercent: "10.00",
  ivaRetentionRatePercent: "10.6667",
  contractTemplateKey: null,
  paymentPlanId: null,
  questionnaireTemplateKey: null,
  taxRatePercent: "16.00",
};

export function validateQuoteCreate(values: QuoteCreateValues) {
  const errors: QuoteCreateErrors = {};
  if (!values.title.trim()) errors.title = "crm.quote.validation.required";
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function validateQuoteProduct(values: QuoteAddProductValues) {
  const errors: QuoteProductErrors = {};
  if (!values.productId) errors.productId = "crm.quote.validation.required";
  if (!values.quantity || Number(values.quantity) <= 0) {
    errors.quantity = "crm.quote.validation.quantity";
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function validateQuoteManualItem(values: QuoteAddManualItemValues) {
  return validateQuoteItem(values);
}

export function validateQuoteItem(values: QuoteUpdateItemValues) {
  const errors: QuoteItemErrors = {};
  if (!values.description.trim()) {
    errors.description = "crm.quote.validation.required";
  }
  if (!values.quantity || Number(values.quantity) <= 0) {
    errors.quantity = "crm.quote.validation.quantity";
  }
  if (!values.unitPriceMxn || Number(values.unitPriceMxn) < 0) {
    errors.unitPriceMxn = "crm.quote.validation.money";
  }
  if (!values.cogMxn || Number(values.cogMxn) < 0) {
    errors.cogMxn = "crm.quote.validation.money";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function validateQuoteVersion(values: QuoteUpdateVersionValues) {
  const errors: QuoteVersionErrors = {};
  if (!["cad", "mxn", "usd"].includes(values.displayCurrency)) {
    errors.displayCurrency = "crm.quote.validation.required";
  }
  if (!["amount", "percent"].includes(values.discountType)) {
    errors.discountType = "crm.quote.validation.required";
  }
  if (!values.discountValueMxn || Number(values.discountValueMxn) < 0) {
    errors.discountValueMxn = "crm.quote.validation.money";
  }
  if (!values.exchangeRateToMxn || Number(values.exchangeRateToMxn) <= 0) {
    errors.exchangeRateToMxn = "crm.quote.validation.money";
  }
  if (!values.exchangeRateMarginPercent || Number(values.exchangeRateMarginPercent) < 0) {
    errors.exchangeRateMarginPercent = "crm.quote.validation.money";
  }
  if (!values.taxRatePercent || Number(values.taxRatePercent) < 0) {
    errors.taxRatePercent = "crm.quote.validation.money";
  }
  if (!values.ivaRetentionRatePercent || Number(values.ivaRetentionRatePercent) < 0) {
    errors.ivaRetentionRatePercent = "crm.quote.validation.money";
  }
  if (!values.isrRetentionRatePercent || Number(values.isrRetentionRatePercent) < 0) {
    errors.isrRetentionRatePercent = "crm.quote.validation.money";
  }
  if (values.expiresAt && Number.isNaN(Date.parse(values.expiresAt))) {
    errors.expiresAt = "crm.quote.validation.required";
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function validateQuoteRecipients(values: QuoteRecipientValues[]) {
  const errors: QuoteRecipientErrors[] = values.map((recipient) => {
    const recipientErrors: QuoteRecipientErrors = {};
    if (!recipient.name.trim()) recipientErrors.name = "crm.quote.validation.required";
    if (!recipient.email.trim() || !recipient.email.includes("@")) {
      recipientErrors.email = "crm.quote.validation.required";
    }
    return recipientErrors;
  });
  const isValid = errors.every((error) => !Object.keys(error).length);
  return { errors, isValid };
}
