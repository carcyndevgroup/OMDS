import type { CrmRecordMeta } from "@/features/crm/shared/types/crm-record";

export type EmailTemplateDocumentKind =
  | "questionnaire"
  | "contract"
  | "invoice"
  | "quote"
  | "general";

export type EmailTemplate = CrmRecordMeta & {
  body: string;
  description: string;
  documentKind: EmailTemplateDocumentKind;
  isActive: boolean;
  isDefault: boolean;
  subject: string;
  templateKey: string;
  title: string;
};

export type EmailTemplateFormValues = {
  body: string;
  description: string;
  documentKind: EmailTemplateDocumentKind;
  isActive: boolean;
  isDefault: boolean;
  subject: string;
  templateKey: string;
  title: string;
};

export type EmailTemplateVersion = {
  body: string;
  createdAt: string;
  description: string;
  documentKind: EmailTemplateDocumentKind;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  subject: string;
  templateId: string;
  templateKey: string;
  title: string;
  versionNumber: number;
};
