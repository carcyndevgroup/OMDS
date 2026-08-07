import type { BookingType } from "../../client/types/client";
import type { EventEquipmentAssignment } from "../../equipment/types/event-equipment";
import type { EventFile } from "../../files/types/event-file";
import type { EventStaffAssignment } from "../../staff/types/staff";
import type {
  BookingStatus,
  ContactRole,
  EventType,
} from "../../shared/types/crm-options";

export type EventContactSummary = {
  clientId: string;
  email: string;
  isPrimary: boolean;
  name: string;
  phone: string;
  role: ContactRole;
};

export type EventVenueContactSummary = {
  email: string;
  id: string;
  name: string;
  phone: string;
  role: string;
};

export type EventPlannerSummary = {
  commissionEligible: boolean;
  id: string;
  name: string;
  phone: string;
  plannerId: string;
  role: string;
};

export type EventListItem = {
  bookingStatus: BookingStatus;
  bookingType: BookingType;
  clientId: string;
  clientName: string;
  eventDate: string;
  eventId: string;
  eventType: EventType;
  guestCount: number;
  plannerNames: string[];
  serviceStartTime: string | null;
  serviceIds: string[];
  venueName: string;
};

export type EventDetail = EventListItem & {
  arrivalBufferMinutes: number;
  clientOperationalNotes: string;
  contacts: EventContactSummary[];
  createdAt: string;
  departureBufferMinutes: number;
  eventVenueContactId: string | null;
  eventVenueContactName: string;
  eventVenueContactPhone: string;
  eventVenueContactRole: string;
  eventHashtags: string;
  eventName: string;
  filesToInclude: EventFile[];
  internalIssueNotes: string;
  loadBeforeDepartureMinutes: number;
  marqueeSignNames: string;
  notes: string;
  operationsNotes: string;
  packUpMinutes: number;
  secondaryContacts: EventVenueContactSummary[];
  paymentPartnerName: string;
  facturaRecipient: string;
  planners: EventPlannerSummary[];
  powerSupplyAccess: string;
  powerSupplyNotes: string;
  serviceDurationMinutes: number;
  serviceEndTime: string | null;
  serviceLocationDescription: string;
  serviceStartTime: string | null;
  setupDurationMinutes: number;
  specialRequests: string;
  equipmentAssignments: EventEquipmentAssignment[];
  staffAssignments: EventStaffAssignment[];
  travelTimeMinutes: number | null;
  updatedAt: string;
  unloadAfterReturnMinutes: number;
  venueAddress: string;
  venueArea: string;
  venueId: string | null;
  venueInvoiceBehavior: string;
  venueNotes: string;
  venueRequiresSatFiscal: boolean;
  venueSubLocationId: string | null;
  venueSubLocationName: string;
  venueSubLocationOther: string;
  venueUsesSubLocations: boolean;
};
