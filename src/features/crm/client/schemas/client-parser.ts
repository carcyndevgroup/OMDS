import type {
  BookingStatus,
  ContactRole,
  EventType,
  LeadSource,
} from "../../shared/types/crm-options";
import type { BookingType, ClientFormValues } from "../types/client";
import { initialClientFormValues } from "./client-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof ClientFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

export function parseClientFormValues(input: unknown): ClientFormValues {
  const source = isRecord(input) ? input : {};
  const serviceIds = Array.isArray(source.serviceIds)
    ? source.serviceIds.filter((item): item is string => typeof item === "string")
    : [];

  return {
    bookingStatus: (readString(source, "bookingStatus") ||
      initialClientFormValues.bookingStatus) as BookingStatus,
    bookingType: readString(source, "bookingType") as BookingType | "",
    city: readString(source, "city"),
    companyName: readString(source, "companyName"),
    country: readString(source, "country"),
    email: readString(source, "email"),
    eventDate: readString(source, "eventDate"),
    eventVenueContactId: readString(source, "eventVenueContactId"),
    eventType: readString(source, "eventType") as EventType | "",
    facebook: readString(source, "facebook"),
    firstName: readString(source, "firstName"),
    guestCount: readString(source, "guestCount"),
    instagram: readString(source, "instagram"),
    internalIssueNotes: readString(source, "internalIssueNotes"),
    lastName: readString(source, "lastName"),
    leadSource: readString(source, "leadSource") as LeadSource | "",
    notes: readString(source, "notes"),
    operationsNotes: readString(source, "operationsNotes"),
    paymentPartnerVenueId: readString(source, "paymentPartnerVenueId"),
    phone: readString(source, "phone"),
    postalCode: readString(source, "postalCode"),
    role: readString(source, "role") as ContactRole | "",
    serviceIds,
    serviceEndTime: readString(source, "serviceEndTime"),
    serviceStartTime: readString(source, "serviceStartTime"),
    stateProvince: readString(source, "stateProvince"),
    streetAddress: readString(source, "streetAddress"),
    venueId: readString(source, "venueId"),
    venueDraft: null,
    venueName: readString(source, "venueName"),
    venueSubLocationId: readString(source, "venueSubLocationId"),
    venueSubLocationOther: readString(source, "venueSubLocationOther"),
  };
}
