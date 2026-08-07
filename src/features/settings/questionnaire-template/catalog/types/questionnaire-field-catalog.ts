import type { CrmRecordMeta } from "@/features/crm/shared/types/crm-record";

export type QuestionnaireFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "date"
  | "time"
  | "number"
  | "repeatable";

export type QuestionnaireFieldCatalogItem = CrmRecordMeta & {
  fieldKey: string;
  helperEn: string;
  helperEs: string;
  isActive: boolean;
  labelEn: string;
  labelEs: string;
  questionType: QuestionnaireFieldType;
  sortOrder: string;
  targetColumn: string;
  targetTable: string;
};

export type QuestionnaireFieldCatalogFormValues = {
  fieldKey: string;
  helperEn: string;
  helperEs: string;
  isActive: boolean;
  labelEn: string;
  labelEs: string;
  questionType: QuestionnaireFieldType;
  sortOrder: string;
  targetColumn: string;
  targetTable: string;
};
