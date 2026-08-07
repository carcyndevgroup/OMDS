import type { BookingType } from "@/features/crm/client/types/client";
import type { EventType } from "@/features/crm/shared/types/crm-options";
import type { CrmRecordMeta } from "@/features/crm/shared/types/crm-record";

export type ContractTemplate = CrmRecordMeta & {
  body: string;
  bookingType: BookingType | "";
  description: string;
  eventType: EventType | "";
  isActive: boolean;
  isDefault: boolean;
  templateKey: string;
  title: string;
};

export type ContractTemplateFormValues = {
  body: string;
  bookingType: BookingType | "";
  description: string;
  eventType: EventType | "";
  isActive: boolean;
  isDefault: boolean;
  templateKey: string;
  title: string;
};

export type ContractTemplateVersion = {
  body: string;
  bookingType: BookingType | "";
  createdAt: string;
  description: string;
  eventType: EventType | "";
  id: string;
  isActive: boolean;
  isDefault: boolean;
  templateId: string;
  templateKey: string;
  title: string;
  versionNumber: number;
};
