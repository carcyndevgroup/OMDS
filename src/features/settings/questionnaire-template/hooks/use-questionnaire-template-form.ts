import { useCallback, useState } from "react";

import {
  validateQuestionnaireTemplateForm,
  type QuestionnaireTemplateFormErrors,
} from "../schemas/questionnaire-template-schema";
import type { QuestionnaireTemplateFormValues } from "../types/questionnaire-template";

export function useQuestionnaireTemplateForm(
  initialValues: QuestionnaireTemplateFormValues,
  onSubmit: (values: QuestionnaireTemplateFormValues) => Promise<void>,
) {
  const [errors, setErrors] = useState<QuestionnaireTemplateFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(
    <TKey extends keyof QuestionnaireTemplateFormValues>(key: TKey, value: QuestionnaireTemplateFormValues[TKey]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateQuestionnaireTemplateForm(values);
    setErrors(validation.errors);
    if (!validation.isValid) return false;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { errors, isSubmitting, setField, submit, values };
}
