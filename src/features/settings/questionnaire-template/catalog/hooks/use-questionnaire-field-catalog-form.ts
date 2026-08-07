"use client";

import { useCallback, useState } from "react";

import {
  validateQuestionnaireFieldCatalogForm,
  type QuestionnaireFieldCatalogFormErrors,
} from "../schemas/questionnaire-field-catalog-schema";
import type { QuestionnaireFieldCatalogFormValues } from "../types/questionnaire-field-catalog";

export function useQuestionnaireFieldCatalogForm(
  initialValues: QuestionnaireFieldCatalogFormValues,
  onSubmit: (values: QuestionnaireFieldCatalogFormValues) => Promise<void>,
) {
  const [errors, setErrors] = useState<QuestionnaireFieldCatalogFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(
    <TKey extends keyof QuestionnaireFieldCatalogFormValues>(
      key: TKey,
      value: QuestionnaireFieldCatalogFormValues[TKey],
    ) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const setFields = useCallback((nextValues: Partial<QuestionnaireFieldCatalogFormValues>) => {
    setValues((current) => ({ ...current, ...nextValues }));
    setErrors((current) => {
      const nextErrors = { ...current };
      for (const key of Object.keys(nextValues) as (keyof QuestionnaireFieldCatalogFormValues)[]) {
        nextErrors[key] = undefined;
      }
      return nextErrors;
    });
  }, []);

  const submit = async () => {
    const validation = validateQuestionnaireFieldCatalogForm(values);
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

  return { errors, isSubmitting, setField, setFields, submit, values };
}
