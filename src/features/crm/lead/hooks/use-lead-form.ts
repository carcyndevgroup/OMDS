import { useCallback, useMemo, useState } from "react";

import {
  initialLeadFormValues,
  validateLeadForm,
  type LeadFormErrors,
} from "../schemas/lead-schema";
import type { LeadFormValues } from "../types/lead";

export type LeadFormSubmitHandler = (
  values: LeadFormValues,
) => void | Promise<void>;

type LeadFormField = keyof LeadFormValues;

export function useLeadForm(
  onSubmit?: LeadFormSubmitHandler,
  initialValues: LeadFormValues = initialLeadFormValues,
) {
  const [values, setValues] = useState<LeadFormValues>(initialValues);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = useMemo(() => validateLeadForm(values), [values]);

  const setFieldValue = useCallback(
    <TField extends LeadFormField>(
      field: TField,
      value: LeadFormValues[TField],
    ) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }));
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submitForm = useCallback(async () => {
    const nextValidation = validateLeadForm(values);

    setErrors(nextValidation.errors);

    if (!nextValidation.isValid) return false;

    setIsSubmitting(true);

    try {
      await onSubmit?.(values);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values]);

  return {
    errors,
    isSubmitting,
    isValid: validation.isValid,
    resetForm,
    setFieldValue,
    submitForm,
    values,
  };
}
