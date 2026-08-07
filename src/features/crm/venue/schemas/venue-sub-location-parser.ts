import type { VenueSubLocationFormValues } from "../types/venue-sub-location";
import { initialVenueSubLocationFormValues } from "./venue-sub-location-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof VenueSubLocationFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

export function parseVenueSubLocationFormValues(
  input: unknown,
): VenueSubLocationFormValues {
  const source = isRecord(input) ? input : {};

  return {
    isActive:
      typeof source.isActive === "boolean"
        ? source.isActive
        : initialVenueSubLocationFormValues.isActive,
    name: readString(source, "name"),
    notes: readString(source, "notes"),
  };
}
