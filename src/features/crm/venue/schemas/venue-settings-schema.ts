import type { Venue, VenueSettingsFormValues } from "../types/venue";

export const initialVenueSettingsFormValues: VenueSettingsFormValues = {
  brochureBehavior: "pv_brochure",
  commissionFixedAmount: "",
  commissionModel: "fixed_percentage",
  commissionPercentage: "",
  facturaRecipient: "venue_hotel",
  fiscalDefaultBankAccountId: "",
  fiscalDefaultProfileId: "",
  invoiceBehavior: "venue_fiscal_factura",
  paymentResponsibility: "venue_hotel",
  quotePricingModel: "pv_commission",
  settingsNotes: "",
  suppressClientInvoice: true,
};

export const toVenueSettingsFormValues = (
  venue: Venue,
): VenueSettingsFormValues => ({
  brochureBehavior: venue.brochureBehavior,
  commissionFixedAmount: venue.commissionFixedAmount?.toString() ?? "",
  commissionModel: venue.commissionModel,
  commissionPercentage: venue.commissionPercentage?.toString() ?? "",
  facturaRecipient: venue.facturaRecipient,
  fiscalDefaultBankAccountId: venue.fiscalDefaultBankAccountId,
  fiscalDefaultProfileId: venue.fiscalDefaultProfileId,
  invoiceBehavior: venue.invoiceBehavior,
  paymentResponsibility: venue.paymentResponsibility,
  quotePricingModel: venue.quotePricingModel,
  settingsNotes: venue.settingsNotes,
  suppressClientInvoice: venue.suppressClientInvoice,
});
