import type { TranslationKey } from "@/core/i18n";

import type { ContractTemplateFormValues } from "../types/contract-template";

export type ContractTemplateFormErrors = Partial<
  Record<keyof ContractTemplateFormValues, TranslationKey>
>;

export const initialContractTemplateFormValues: ContractTemplateFormValues = {
  body: "",
  bookingType: "",
  description: "",
  eventType: "",
  isActive: true,
  isDefault: false,
  templateKey: "",
  title: "",
};

export function validateContractTemplateForm(values: ContractTemplateFormValues) {
  const errors: ContractTemplateFormErrors = {};
  if (!values.templateKey.trim()) errors.templateKey = "settings.contractTemplate.validation.required";
  if (!values.title.trim()) errors.title = "settings.contractTemplate.validation.required";
  if (!values.body.trim()) errors.body = "settings.contractTemplate.validation.required";
  return { errors, isValid: Object.keys(errors).length === 0 };
}
