import type { QuoteVersion } from "../types/quote";

type QuoteMoneySource = Pick<
  QuoteVersion,
  "applyExchangeRateMargin" | "displayCurrency" | "exchangeRateMarginPercent" | "exchangeRateToMxn"
>;

const safeNumber = (value: number | string | null | undefined) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const getCurrencyCode = (currency: QuoteMoneySource["displayCurrency"]) => {
  return currency.toUpperCase();
};

export function getQuoteDiscountAmountMxn(version: QuoteVersion) {
  const discountValue = safeNumber(version.discountValueMxn);
  const itemsTotal = safeNumber(version.itemsTotalMxn);

  if (version.discountType === "percent") {
    return itemsTotal * (discountValue / 100);
  }

  return discountValue;
}

export function convertQuoteAmountFromMxn(
  valueMxn: number | string | null | undefined,
  source: QuoteMoneySource,
) {
  const amountMxn = safeNumber(valueMxn);

  if (source.displayCurrency === "mxn") return amountMxn;

  const baseRate = safeNumber(source.exchangeRateToMxn);
  const margin = source.applyExchangeRateMargin
    ? safeNumber(source.exchangeRateMarginPercent) / 100
    : 0;
  const marginMultiplier = Math.max(1 - margin, 0.01);
  const exchangeRate = baseRate * marginMultiplier;
  return exchangeRate > 0 ? amountMxn / exchangeRate : amountMxn;
}

export function formatQuoteMoney(
  valueMxn: number | string | null | undefined,
  source: QuoteMoneySource,
) {
  const currency = getCurrencyCode(source.displayCurrency);
  const amount = convertQuoteAmountFromMxn(valueMxn, source);

  return `${currency} ${new Intl.NumberFormat("en-US", {
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(amount)}`;
}
