import type { TranslationKey } from "@/core/i18n";

import type { QuestionnaireTemplateFormValues } from "../types/questionnaire-template";
import { createBilingualQuestionnaireDefinition } from "../utils/questionnaire-definition";

export type QuestionnaireTemplateFormErrors = Partial<
  Record<keyof QuestionnaireTemplateFormValues, TranslationKey>
>;

export const sampleQuestionnaireDefinition = createBilingualQuestionnaireDefinition();

export const initialQuestionnaireTemplateFormValues: QuestionnaireTemplateFormValues = {
  bookingType: "",
  definitionJson: JSON.stringify(sampleQuestionnaireDefinition, null, 2),
  description: "",
  eventType: "",
  isActive: true,
  isDefault: false,
  templateKey: "",
  title: "",
};

export function validateQuestionnaireTemplateForm(values: QuestionnaireTemplateFormValues) {
  const errors: QuestionnaireTemplateFormErrors = {};
  if (!values.templateKey.trim()) errors.templateKey = "settings.questionnaireTemplate.validation.required";
  if (!values.title.trim()) errors.title = "settings.questionnaireTemplate.validation.required";
  if (!values.definitionJson.trim()) {
    errors.definitionJson = "settings.questionnaireTemplate.validation.required";
  } else {
    try {
      JSON.parse(values.definitionJson);
    } catch {
      errors.definitionJson = "settings.questionnaireTemplate.validation.json";
    }
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
}
