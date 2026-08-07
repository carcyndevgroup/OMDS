import type { BookingType } from "@/features/crm/client/types/client";
import type { EventType } from "@/features/crm/shared/types/crm-options";
import type { CrmRecordMeta } from "@/features/crm/shared/types/crm-record";
import type { Json } from "@/core/supabase/json.types";

export type QuestionnaireTemplate = CrmRecordMeta & {
  bookingType: BookingType | "";
  definition: Json;
  description: string;
  eventType: EventType | "";
  isActive: boolean;
  isDefault: boolean;
  templateKey: string;
  title: string;
};

export type QuestionnaireTemplateFormValues = {
  bookingType: BookingType | "";
  definitionJson: string;
  description: string;
  eventType: EventType | "";
  isActive: boolean;
  isDefault: boolean;
  templateKey: string;
  title: string;
};
