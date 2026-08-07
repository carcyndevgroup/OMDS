import type { VenueSettingsFormValues } from "../types/venue";
import { initialVenueSettingsFormValues } from "./venue-settings-schema";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export function parseVenueSettingsFormValues(input: unknown): VenueSettingsFormValues {
  if (!input || typeof input !== "object") {
    return initialVenueSettingsFormValues;
  }

  const source = input as Record<string, unknown>;
  return {
    brochureBehavior: asString(source.brochureBehavior),
    commissionFixedAmount: asString(source.commissionFixedAmount),
    commissionModel: asString(source.commissionModel),
    commissionPercentage: asString(source.commissionPercentage),
    facturaRecipient: asString(source.facturaRecipient),
    fiscalDefaultBankAccountId: asString(source.fiscalDefaultBankAccountId),
    fiscalDefaultProfileId: asString(source.fiscalDefaultProfileId),
    invoiceBehavior: asString(source.invoiceBehavior),
    paymentResponsibility: asString(source.paymentResponsibility),
    quotePricingModel: asString(source.quotePricingModel),
    settingsNotes: asString(source.settingsNotes),
    suppressClientInvoice: source.suppressClientInvoice === true,
  };
}
