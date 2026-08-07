import type { BookingStatus, EventType } from "../../shared/types/crm-options";
import type { BookingType } from "../../client/types/client";

export type PlannerEventListItem = {
  bookingStatus: BookingStatus;
  bookingType: BookingType;
  clientEmail: string;
  clientId: string;
  clientName: string;
  commissionEligible: boolean;
  commissionPercentageOverride: number | null;
  eventDate: string;
  eventId: string;
  eventPlannerId: string;
  eventType: EventType;
  guestCount: number;
  role: string;
  venueName: string;
};
