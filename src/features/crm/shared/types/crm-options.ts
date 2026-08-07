export type ContactRole =
  | "bride"
  | "groom"
  | "parent_family"
  | "external_planner"
  | "hotel_resort"
  | "private_venue"
  | "other";

export type EventType =
  | "wedding"
  | "social_event"
  | "corporate_event"
  | "convention"
  | "other";

export type LeadSource =
  | "website"
  | "facebook"
  | "facebook_group"
  | "instagram"
  | "tiktok"
  | "external_planner"
  | "hotel_venue"
  | "hotel_venue_pv"
  | "vendor_referral"
  | "client_referral"
  | "other";

export type ServiceCategory = "desserts" | "snacks";

export type BookingStatus =
  | "quote_requested"
  | "proposal_sent"
  | "tentative_hold"
  | "confirmed"
  | "cancelled"
  | "lost";
