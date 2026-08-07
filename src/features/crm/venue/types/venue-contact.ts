import type { CrmRecordMeta } from "../../shared/types/crm-record";

export type VenueContact = CrmRecordMeta & {
  email: string;
  isActive: boolean;
  name: string;
  notes: string;
  phone: string;
  preferredContactMethod: string;
  role: string;
  venueId: string;
  whatsapp: string;
};

export type VenueContactFormValues = {
  email: string;
  isActive: boolean;
  name: string;
  notes: string;
  phone: string;
  preferredContactMethod: string;
  role: string;
  whatsapp: string;
};
