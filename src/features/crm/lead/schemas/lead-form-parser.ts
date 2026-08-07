import { initialLeadFormValues } from "./lead-schema";
import type { LeadFormValues, LeadStatus } from "../types/lead";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof LeadFormValues) => {
  const value = source[key];
  return typeof value === "string" ? value : "";
};

const readStringArray = (source: UnknownRecord, key: keyof LeadFormValues) => {
  const value = source[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

export function parseLeadFormValues(input: unknown): LeadFormValues {
  const source = isRecord(input) ? input : {};

  return {
    ...initialLeadFormValues,
    email: readString(source, "email"),
    eventDate: readString(source, "eventDate"),
    eventType: readString(source, "eventType") as LeadFormValues["eventType"],
    guestCount: readString(source, "guestCount"),
    leadSource: readString(source, "leadSource") as LeadFormValues["leadSource"],
    name: readString(source, "name"),
    notes: readString(source, "notes"),
    phone: readString(source, "phone"),
    role: readString(source, "role") as LeadFormValues["role"],
    serviceIds: readStringArray(source, "serviceIds"),
    status: (readString(source, "status") || initialLeadFormValues.status) as LeadStatus,
    venueName: readString(source, "venueName"),
    archivedAt: null,
    venueId: readString(source, "venueId"),
    venueDraft: null,
  };
}
