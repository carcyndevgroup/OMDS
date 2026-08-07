import type { TranslationKey } from "@/core/i18n";

import type { LeadFormValues } from "../types/lead";

type LeadFormSection = {
  id: string;
  translationKey: TranslationKey;
  fields: (keyof LeadFormValues)[];
};

export const leadFormSections: LeadFormSection[] = [
  {
    id: "client_details",
    translationKey: "crm.lead.section.clientDetails",
    fields: ["name", "email", "phone", "role"],
  },
  {
    id: "event_details",
    translationKey: "crm.lead.section.eventDetails",
    fields: ["eventType", "eventDate", "guestCount", "venueName"],
  },
  {
    id: "services_interested_in",
    translationKey: "crm.lead.section.servicesInterestedIn",
    fields: ["serviceIds"],
  },
  {
    id: "other_information",
    translationKey: "crm.lead.section.otherInformation",
    fields: ["notes", "leadSource", "status"],
  },
];
