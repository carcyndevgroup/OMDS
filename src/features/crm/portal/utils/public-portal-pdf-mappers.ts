import type { Invoice } from "@/features/crm/invoice/types/invoice";
import type { QuoteSummary, QuoteVersion } from "@/features/crm/quote/types/quote";

import type {
  PublicPortalInvoice,
  PublicPortalQuestionnaire,
  PublicPortalQuote,
} from "../types/client-portal";

export function mapPublicQuoteToPdfModel(quote: PublicPortalQuote): QuoteSummary {
  return {
    currentVersion: {
      applyExchangeRateMargin: quote.applyExchangeRateMargin,
      appliesIsrRetention: quote.appliesIsrRetention,
      appliesIvaRetention: quote.appliesIvaRetention,
      appliesIvaTax: quote.appliesIvaTax,
      contractTemplateKey: null,
      discountType: "amount",
      discountValueMxn: "0.00",
      displayCurrency: quote.displayCurrency,
      exchangeRateMarginPercent: quote.exchangeRateMarginPercent,
      exchangeRateToMxn: quote.exchangeRateToMxn,
      expiresAt: quote.expiresAt ?? "",
      id: quote.versionId,
      isrRetentionMxn: quote.isrRetentionMxn,
      isrRetentionRatePercent: "0.00",
      items: quote.items.map((item, index) => ({
        cogMxn: "0.00",
        description: item.description,
        details: item.details,
        id: `${quote.id}-${index}`,
        isTaxable: true,
        lineTotalMxn: item.lineTotalMxn,
        productId: null,
        quantity: item.quantity,
        sortOrder: item.sortOrder,
        unitPriceMxn: item.unitPriceMxn,
      })),
      itemsTotalMxn: quote.subtotalMxn,
      ivaRetentionMxn: quote.ivaRetentionMxn,
      ivaRetentionRatePercent: "0.00",
      ivaTaxMxn: quote.ivaTaxMxn,
      paymentPlanId: null,
      questionnaireTemplateKey: null,
      sentAt: quote.issuedAt,
      status: quote.versionStatus as QuoteVersion["status"],
      subtotalMxn: quote.subtotalMxn,
      taxRatePercent: "0.00",
      taxTotalMxn: quote.taxTotalMxn,
      totalMxn: quote.totalMxn,
      versionNumber: quote.versionNumber,
    },
    id: quote.id,
    recipients: [],
    status: quote.status as QuoteSummary["status"],
    title: quote.title,
    versions: [
      {
        id: quote.versionId,
        status: quote.versionStatus as QuoteSummary["versions"][number]["status"],
        versionNumber: quote.versionNumber,
      },
    ],
  };
}

export function mapPublicInvoiceToPdfModel(invoice: PublicPortalInvoice, eventId: string): Invoice {
  return {
    clientVisible: invoice.clientVisible,
    contractId: invoice.contractId,
    displayCurrency: invoice.displayCurrency,
    dueAt: invoice.dueAt,
    eventId,
    id: invoice.invoiceId,
    installmentKey: invoice.installmentKey,
    invoiceType: invoice.invoiceType,
    issuedAt: invoice.issuedAt,
    items: invoice.items.map((item, index) => ({
      description: item.description,
      details: item.details,
      id: `${invoice.invoiceId}-${index}`,
      isTaxable: true,
      lineTotalMxn: item.lineTotalMxn,
      quantity: item.quantity,
      sortOrder: item.sortOrder,
      unitPriceMxn: item.unitPriceMxn,
    })),
    paidAt: invoice.paidAt,
    paymentPromisedAt: invoice.paymentPromisedAt,
    quoteVersionId: null,
    status: invoice.status,
    subtotalMxn: invoice.subtotalMxn,
    taxTotalMxn: invoice.taxTotalMxn,
    totalMxn: invoice.totalMxn,
  };
}

export function canDownloadQuestionnaire(questionnaire: PublicPortalQuestionnaire) {
  return questionnaire.status === "submitted";
}
