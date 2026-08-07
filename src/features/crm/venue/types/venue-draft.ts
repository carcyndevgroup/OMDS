import type { VenueFormValues } from "./venue";

export type VenueDraft = Pick<
  VenueFormValues,
  | "city"
  | "country"
  | "googleMapsUrl"
  | "name"
  | "phone"
  | "postalCode"
  | "stateProvince"
  | "streetAddress"
  | "websiteUrl"
>;