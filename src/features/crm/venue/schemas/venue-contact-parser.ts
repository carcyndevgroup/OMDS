import type { VenueContactFormValues } from "../types/venue-contact";
import { initialVenueContactFormValues } from "./venue-contact-schema";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export function parseVenueContactFormValues(input: unknown): VenueContactFormValues {
  if (!input || typeof input !== "object") return initialVenueContactFormValues;

  const source = input as Record<string, unknown>;

  return {
    email: asString(source.email),
    isActive: source.isActive !== false,
    name: asString(source.name),
    notes: asString(source.notes),
    phone: asString(source.phone),
    preferredContactMethod: asString(source.preferredContactMethod) || "email",
    role: asString(source.role),
    whatsapp: asString(source.whatsapp),
  };
}
