import type { CrmRecordMeta } from "../../shared/types/crm-record";
import type { VenueDraft } from "../../venue/types/venue-draft";

import type {
  ContactRole,
  EventType as CrmEventType,
  LeadSource as CrmLeadSource,
  ServiceCategory as CrmServiceCategory,
} from "../../shared/types/crm-options";

export type LeadRole = ContactRole;
export type EventType = CrmEventType;
export type LeadSource = CrmLeadSource;

export type LeadStatus =
  | "new"
  | "contacted"
  | "waiting_on_lead"
  | "converted"
  | "lost"
  | "spam";

export type ServiceCategory = CrmServiceCategory;

export type LeadFormValues = {
  name: string;
  archivedAt: string | null;
  email: string;
  phone: string;
  role: LeadRole | "";
  eventType: EventType | "";
  eventDate: string;
  guestCount: string;
  venueName: string;
  venueId: string;
  venueDraft: VenueDraft | null;
  serviceIds: string[];
  notes: string;
  leadSource: LeadSource | "";
  status: LeadStatus;
};

export type Lead = LeadFormValues & CrmRecordMeta;
