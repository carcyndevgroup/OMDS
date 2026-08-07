import type { TranslationKey } from "@/core/i18n";

import type {
  ContactRole,
  EventType,
  LeadSource,
} from "../types/crm-options";

type CrmOption<TValue extends string> = {
  translationKey: TranslationKey;
  value: TValue;
};

export const contactRoleOptions: CrmOption<ContactRole>[] = [
  { value: "bride", translationKey: "crm.lead.role.bride" },
  { value: "groom", translationKey: "crm.lead.role.groom" },
  { value: "parent_family", translationKey: "crm.lead.role.parentFamily" },
  { value: "external_planner", translationKey: "crm.lead.role.externalPlanner" },
  { value: "hotel_resort", translationKey: "crm.lead.role.hotelResort" },
  { value: "private_venue", translationKey: "crm.lead.role.privateVenue" },
  { value: "other", translationKey: "crm.lead.option.other" },
];

export const eventTypeOptions: CrmOption<EventType>[] = [
  { value: "wedding", translationKey: "crm.lead.eventType.wedding" },
  { value: "social_event", translationKey: "crm.lead.eventType.socialEvent" },
  { value: "corporate_event", translationKey: "crm.lead.eventType.corporateEvent" },
  { value: "convention", translationKey: "crm.lead.eventType.convention" },
  { value: "other", translationKey: "crm.lead.option.other" },
];

export const leadSourceOptions: CrmOption<LeadSource>[] = [
  { value: "website", translationKey: "crm.lead.leadSource.website" },
  { value: "facebook", translationKey: "crm.lead.leadSource.facebook" },
  { value: "facebook_group", translationKey: "crm.lead.leadSource.facebookGroup" },
  { value: "instagram", translationKey: "crm.lead.leadSource.instagram" },
  { value: "tiktok", translationKey: "crm.lead.leadSource.tiktok" },
  { value: "external_planner", translationKey: "crm.lead.leadSource.externalPlanner" },
  { value: "hotel_venue", translationKey: "crm.lead.leadSource.hotelVenue" },
  { value: "hotel_venue_pv", translationKey: "crm.lead.leadSource.hotelVenuePv" },
  { value: "vendor_referral", translationKey: "crm.lead.leadSource.vendorReferral" },
  { value: "client_referral", translationKey: "crm.lead.leadSource.clientReferral" },
  { value: "other", translationKey: "crm.lead.option.other" },
];
