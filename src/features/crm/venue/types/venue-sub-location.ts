import type { CrmRecordMeta } from "../../shared/types/crm-record";

export type VenueSubLocation = CrmRecordMeta & {
  isActive: boolean;
  name: string;
  notes: string;
  venueId: string;
};

export type VenueSubLocationFormValues = {
  isActive: boolean;
  name: string;
  notes: string;
};
