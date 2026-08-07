import type { CrmRecordMeta } from "../../shared/types/crm-record";
import type {
  BookingStatus,
  ContactRole,
  EventType,
  LeadSource,
} from "../../shared/types/crm-options";
import type { VenueDraft } from "../../venue/types/venue-draft";

export type BookingType = "direct" | "preferred_vendor";

export type ClientFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  role: ContactRole | "";
  bookingType: BookingType | "";
  paymentPartnerVenueId: string;
  leadSource: LeadSource | "";
  eventType: EventType | "";
  eventDate: string;
  serviceStartTime: string;
  serviceEndTime: string;
  guestCount: string;
  venueId: string;
  venueDraft: VenueDraft | null;
  venueName: string;
  venueSubLocationId: string;
  venueSubLocationOther: string;
  eventVenueContactId: string;
  serviceIds: string[];
  instagram: string;
  facebook: string;
  notes: string;
  operationsNotes: string;
  internalIssueNotes: string;
  bookingStatus: BookingStatus;
};

export type Client = CrmRecordMeta & {
  firstName: string;
  lastName: string;
  legalFirstName: string;
  legalLastName: string;
  email: string;
  phone: string;
  companyName: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  leadSource: LeadSource;
  instagram: string;
  facebook: string;
  preferredCommunicationMethod: string;
};

export type ClientEvent = CrmRecordMeta & {
  bookingStatus: BookingStatus;
  bookingType: BookingType;
  eventDate: string;
  eventHashtags: string;
  eventName: string;
  eventType: EventType;
  guestCount: number;
  internalIssueNotes: string;
  clientOperationalNotes: string;
  marqueeSignNames: string;
  notes: string;
  operationsNotes: string;
  paymentPartnerVenueId: string | null;
  powerSupplyAccess: string;
  powerSupplyNotes: string;
  serviceEndTime: string | null;
  serviceLocationDescription: string;
  serviceStartTime: string | null;
  sourceLeadId: string | null;
  specialRequests: string;
  eventVenueContactId: string | null;
  eventVenueContactName: string;
  eventVenueContactPhone: string;
  eventVenueContactRole: string;
  venueId: string | null;
  venueDistanceFromHqKm: number | null;
  venueName: string;
  venueUsesSubLocations: boolean;
  venueSubLocationId: string | null;
  venueSubLocationName: string;
  venueSubLocationOther: string;
};

export type ClientListEvent = {
  bookingStatus: BookingStatus;
  eventDate: string;
  eventId: string;
  venueName: string;
};

export type ClientListItem = {
  archivedAt: string | null;
  companyName: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  nextEvent: ClientListEvent | null;
  phone: string;
};

export type ClientDetailContact = {
  clientId: string;
  email: string;
  firstName: string;
  isPrimary: boolean;
  lastName: string;
  phone: string;
  role: ContactRole;
};

export type ClientDetailEvent = ClientEvent & {
  contacts: ClientDetailContact[];
  paymentPartnerName: string;
  serviceIds: string[];
};

export type ClientDetail = Client & {
  event: ClientDetailEvent | null;
};

export type EventContact = {
  clientId: string;
  eventId: string;
  isPrimary: boolean;
  role: ContactRole;
};
