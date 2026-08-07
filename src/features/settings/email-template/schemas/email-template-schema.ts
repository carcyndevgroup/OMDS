import type { TranslationKey } from "@/core/i18n";

import type { EmailTemplateFormValues } from "../types/email-template";

export type EmailTemplateFormErrors = Partial<
  Record<keyof EmailTemplateFormValues, TranslationKey>
>;

export const initialEmailTemplateFormValues: EmailTemplateFormValues = {
  body: "",
  description: "",
  documentKind: "general",
  isActive: true,
  isDefault: false,
  subject: "",
  templateKey: "",
  title: "",
};

export function validateEmailTemplateForm(values: EmailTemplateFormValues) {
  const errors: EmailTemplateFormErrors = {};
  if (!values.templateKey.trim()) errors.templateKey = "settings.emailTemplate.validation.required";
  if (!values.title.trim()) errors.title = "settings.emailTemplate.validation.required";
  if (!values.subject.trim()) errors.subject = "settings.emailTemplate.validation.required";
  if (!values.body.trim()) errors.body = "settings.emailTemplate.validation.required";
  return { errors, isValid: Object.keys(errors).length === 0 };
}
