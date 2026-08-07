import type { TranslationKey } from "@/core/i18n";

import type { VenueContactFormValues } from "../types/venue-contact";

export type VenueContactFormErrors = Partial<
  Record<keyof VenueContactFormValues, TranslationKey>
>;

export const initialVenueContactFormValues: VenueContactFormValues = {
  email: "",
  isActive: true,
  name: "",
  notes: "",
  phone: "",
  preferredContactMethod: "email",
  role: "",
  whatsapp: "",
};

export function validateVenueContactForm(values: VenueContactFormValues) {
  const errors: VenueContactFormErrors = {};
  if (!values.name.trim()) errors.name = "crm.venue.validation.required";
  if (!values.role) errors.role = "crm.venue.validation.required";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
