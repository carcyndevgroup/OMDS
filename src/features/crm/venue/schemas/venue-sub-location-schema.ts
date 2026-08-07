import type { TranslationKey } from "@/core/i18n";

import type { VenueSubLocationFormValues } from "../types/venue-sub-location";

export type VenueSubLocationFormErrors = Partial<
  Record<keyof VenueSubLocationFormValues, TranslationKey>
>;

export const initialVenueSubLocationFormValues: VenueSubLocationFormValues = {
  isActive: true,
  name: "",
  notes: "",
};

export function validateVenueSubLocationForm(
  values: VenueSubLocationFormValues,
) {
  const errors: VenueSubLocationFormErrors = {};
  if (!values.name.trim()) errors.name = "crm.venue.validation.required";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
