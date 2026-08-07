import type {
  QuoteAddManualItemValues,
  QuoteAddProductValues,
  QuoteCreateValues,
  QuoteRecipientValues,
  QuoteUpdateItemValues,
  QuoteUpdateVersionValues,
} from "../types/quote";
import {
  initialQuoteAddProductValues,
  initialQuoteCreateValues,
  initialQuoteUpdateItemValues,
  initialQuoteUpdateVersionValues,
} from "./quote-schema";

const readString = (source: unknown, key: string) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

const readArray = (source: unknown, key: string) => {
  if (!source || typeof source !== "object") return [];
  const value = (source as Record<string, unknown>)[key];
  return Array.isArray(value) ? value : [];
};

const readBoolean = (source: unknown, key: string, fallback = false) => {
  if (!source || typeof source !== "object") return fallback;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "boolean" ? value : fallback;
};

export function parseQuoteCreateValues(source: unknown): QuoteCreateValues {
  return {
    ...initialQuoteCreateValues,
    title: readString(source, "title"),
  };
}

export function parseQuoteAddProductValues(source: unknown): QuoteAddProductValues {
  return {
    ...initialQuoteAddProductValues,
    productId: readString(source, "productId"),
    quantity: readString(source, "quantity") || "1",
  };
}

export function parseQuoteAddManualItemValues(
  source: unknown,
): QuoteAddManualItemValues {
  return parseQuoteUpdateItemValues(source);
}

export function parseQuoteUpdateItemValues(source: unknown): QuoteUpdateItemValues {
  return {
    ...initialQuoteUpdateItemValues,
    cogMxn: readString(source, "cogMxn") || "0.00",
    description: readString(source, "description"),
    details: readString(source, "details"),
    isTaxable:
      Boolean(source && typeof source === "object" && (source as Record<string, unknown>).isTaxable),
    quantity: readString(source, "quantity") || "1",
    unitPriceMxn: readString(source, "unitPriceMxn") || "0.00",
  };
}

export function parseQuoteUpdateVersionValues(
  source: unknown,
): QuoteUpdateVersionValues {
  const currency = readString(source, "displayCurrency");
  const discountType = readString(source, "discountType");

  return {
    ...initialQuoteUpdateVersionValues,
    applyExchangeRateMargin: readBoolean(source, "applyExchangeRateMargin"),
    appliesIsrRetention: readBoolean(source, "appliesIsrRetention"),
    appliesIvaRetention: readBoolean(source, "appliesIvaRetention"),
    appliesIvaTax: readBoolean(source, "appliesIvaTax", true),
    discountType: discountType === "percent" ? "percent" : "amount",
    discountValueMxn: readString(source, "discountValueMxn") || "0.00",
    displayCurrency:
      currency === "cad" || currency === "usd" ? currency : "mxn",
    exchangeRateMarginPercent:
      readString(source, "exchangeRateMarginPercent") || "0.00",
    exchangeRateToMxn: readString(source, "exchangeRateToMxn") || "1",
    expiresAt: readString(source, "expiresAt"),
    isrRetentionRatePercent:
      readString(source, "isrRetentionRatePercent") || "10.00",
    ivaRetentionRatePercent:
      readString(source, "ivaRetentionRatePercent") || "10.6667",
    contractTemplateKey: readString(source, "contractTemplateKey") || null,
    paymentPlanId: readString(source, "paymentPlanId") || null,
    questionnaireTemplateKey:
      readString(source, "questionnaireTemplateKey") || null,
    taxRatePercent: readString(source, "taxRatePercent") || "16.00",
  };
}

export function parseQuoteRecipientValues(source: unknown): QuoteRecipientValues[] {
  return readArray(source, "recipients").map((recipient) => ({
    clientId: readString(recipient, "clientId") || null,
    email: readString(recipient, "email"),
    name: readString(recipient, "name"),
  }));
}
