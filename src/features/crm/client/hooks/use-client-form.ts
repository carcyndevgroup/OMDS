import { useCallback, useState } from "react";

import {
  initialClientFormValues,
  validateClientForm,
  type ClientFormErrors,
} from "../schemas/client-schema";
import type { ClientFormValues } from "../types/client";

type ClientSubmitHandler = (
  values: ClientFormValues,
) => void | Promise<void>;

export function useClientForm(
  onSubmit: ClientSubmitHandler,
  initialValues = initialClientFormValues,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback(
    <TField extends keyof ClientFormValues>(
      field: TField,
      value: ClientFormValues[TField],
    ) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submitForm = useCallback(async () => {
    const validation = validateClientForm(values);
    setErrors(validation.errors);
    if (!validation.isValid) return false;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values]);

  return {
    errors,
    isSubmitting,
    resetForm,
    setFieldValue,
    submitForm,
    values,
  };
}
