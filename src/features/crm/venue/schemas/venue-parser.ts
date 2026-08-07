import type { VenueFormValues } from "../types/venue";
import { initialVenueFormValues } from "./venue-schema";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export function parseVenueFormValues(input: unknown): VenueFormValues {
  if (!input || typeof input !== "object") {
    return initialVenueFormValues;
  }

  const source = input as Record<string, unknown>;
  return {
    area: asString(source.area),
    city: asString(source.city),
    commissionNotes: asString(source.commissionNotes),
    country: asString(source.country),
    distanceFromHqKm: asString(source.distanceFromHqKm),
    facebook: asString(source.facebook),
    googleMapsUrl: asString(source.googleMapsUrl),
    instagram: asString(source.instagram),
    internalStatus: source.internalStatus === "inactive" ? "inactive" : "active",
    isPreferredVendor: source.isPreferredVendor === true,
    name: asString(source.name),
    notes: asString(source.notes),
    paymentBillingType: asString(source.paymentBillingType),
    phone: asString(source.phone),
    postalCode: asString(source.postalCode),
    requiresSatFiscal: source.requiresSatFiscal === true,
    stateProvince: asString(source.stateProvince),
    streetAddress: asString(source.streetAddress),
    travelTimeMinutes: asString(source.travelTimeMinutes),
    usesSubLocations: source.usesSubLocations === true,
    websiteUrl: asString(source.websiteUrl),
  };
}
