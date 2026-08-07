import type { TranslationKey } from "@/core/i18n";

import type { QuestionnaireFieldCatalogFormValues } from "../types/questionnaire-field-catalog";

export type QuestionnaireFieldCatalogFormErrors = Partial<Record<keyof QuestionnaireFieldCatalogFormValues, TranslationKey>>;

export const initialQuestionnaireFieldCatalogFormValues: QuestionnaireFieldCatalogFormValues = {
  fieldKey: "",
  helperEn: "",
  helperEs: "",
  isActive: true,
  labelEn: "",
  labelEs: "",
  questionType: "text",
  sortOrder: "0",
  targetColumn: "",
  targetTable: "events",
};

const fieldKeyPattern = /^[a-z]+\.[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/;

export function validateQuestionnaireFieldCatalogForm(values: QuestionnaireFieldCatalogFormValues) {
  const errors: QuestionnaireFieldCatalogFormErrors = {};

  if (!values.fieldKey.trim()) {
    errors.fieldKey = "settings.questionnaireTemplate.validation.required";
  } else if (!fieldKeyPattern.test(values.fieldKey.trim())) {
    errors.fieldKey = "settings.questionnaireTemplate.catalog.validation.fieldKey";
  }

  if (!values.labelEn.trim()) errors.labelEn = "settings.questionnaireTemplate.validation.required";
  if (!values.labelEs.trim()) errors.labelEs = "settings.questionnaireTemplate.validation.required";
  if (!values.targetTable.trim()) errors.targetTable = "settings.questionnaireTemplate.validation.required";
  if (!values.targetColumn.trim()) errors.targetColumn = "settings.questionnaireTemplate.validation.required";

  const sortOrder = Number(values.sortOrder);
  if (!Number.isFinite(sortOrder)) errors.sortOrder = "settings.questionnaireTemplate.catalog.validation.sortOrder";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
