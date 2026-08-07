import type { TranslationKey } from "@/core/i18n";

import {
  contactRoleOptions,
  eventTypeOptions,
  leadSourceOptions,
} from "../../shared/constants/crm-options";
import type { LeadStatus } from "../types/lead";

type LeadStatusOption = {
  translationKey: TranslationKey;
  value: LeadStatus;
};

export {
  contactRoleOptions as leadRoleOptions,
  eventTypeOptions,
  leadSourceOptions,
};

export const leadStatusOptions: LeadStatusOption[] = [
  { value: "new", translationKey: "crm.lead.status.new" },
  { value: "contacted", translationKey: "crm.lead.status.contacted" },
  { value: "waiting_on_lead", translationKey: "crm.lead.status.waitingOnLead" },
  { value: "converted", translationKey: "crm.lead.status.converted" },
  { value: "lost", translationKey: "crm.lead.status.lost" },
  { value: "spam", translationKey: "crm.lead.status.spam" },
];
