import type {
  BookingStatus,
  EventType,
} from "../../shared/types/crm-options";
import type { BookingType } from "../../client/types/client";

export type VenueEventListItem = {
  bookingStatus: BookingStatus;
  bookingType: BookingType;
  clientEmail: string;
  clientId: string;
  clientName: string;
  eventDate: string;
  eventId: string;
  eventType: EventType;
  guestCount: number;
  isPaymentPartnerEvent: boolean;
  serviceIds: string[];
};
