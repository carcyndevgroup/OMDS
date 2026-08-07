import type { TranslationKey } from "@/core/i18n";

const option = (translationKey: TranslationKey, value: string) => ({
  translationKey,
  value,
});

export const paymentResponsibilityOptions = [
  option("crm.venue.settings.payment.venueHotel", "venue_hotel"),
  option("crm.venue.settings.payment.client", "client"),
  option("crm.venue.settings.payment.planner", "planner"),
  option("crm.venue.settings.caseByCase", "case_by_case"),
];

export const commissionModelOptions = [
  option("crm.venue.settings.commission.none", "none"),
  option("crm.venue.settings.commission.fixedPercentage", "fixed_percentage"),
  option("crm.venue.settings.commission.fixedAmount", "fixed_amount"),
  option("crm.venue.settings.commission.venueMarkup", "venue_markup"),
  option("crm.venue.settings.commission.notesOnly", "notes_only"),
];

export const invoiceBehaviorOptions = [
  option("crm.venue.settings.invoice.omdsClient", "omds_client_invoice"),
  option("crm.venue.settings.invoice.venueFiscal", "venue_fiscal_factura"),
  option("crm.venue.settings.invoice.both", "both"),
  option("crm.venue.settings.invoice.venueHandles", "venue_handles"),
  option("crm.venue.settings.caseByCase", "case_by_case"),
];

export const quotePricingModelOptions = [
  option("crm.venue.settings.pricing.direct", "direct"),
  option("crm.venue.settings.pricing.pvCommission", "pv_commission"),
  option("crm.venue.settings.pricing.custom", "custom"),
  option("crm.venue.settings.caseByCase", "case_by_case"),
];

export const brochureBehaviorOptions = [
  option("crm.venue.settings.brochure.direct", "direct_brochure"),
  option("crm.venue.settings.brochure.pv", "pv_brochure"),
  option("crm.venue.settings.caseByCase", "case_by_case"),
];
