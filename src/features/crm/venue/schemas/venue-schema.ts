import type { TranslationKey } from "@/core/i18n";

import type { VenueFormValues } from "../types/venue";

export type VenueFormErrors = Partial<
  Record<keyof VenueFormValues, TranslationKey>
>;

export const initialVenueFormValues: VenueFormValues = {
  area: "",
  city: "",
  commissionNotes: "",
  country: "Mexico",
  distanceFromHqKm: "",
  facebook: "",
  googleMapsUrl: "",
  instagram: "",
  internalStatus: "active",
  isPreferredVendor: false,
  name: "",
  notes: "",
  paymentBillingType: "",
  phone: "",
  postalCode: "",
  requiresSatFiscal: false,
  stateProvince: "Quintana Roo",
  streetAddress: "",
  travelTimeMinutes: "",
  usesSubLocations: false,
  websiteUrl: "",
};

export function validateVenueForm(values: VenueFormValues) {
  const errors: VenueFormErrors = {};
  if (!values.name.trim()) errors.name = "crm.venue.validation.required";
  if (!values.area) errors.area = "crm.venue.validation.required";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
