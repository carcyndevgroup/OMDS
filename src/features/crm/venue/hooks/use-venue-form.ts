import { useCallback, useState } from "react";

import {
  validateVenueForm,
  type VenueFormErrors,
} from "../schemas/venue-schema";
import type { VenueFormValues } from "../types/venue";

export function useVenueForm(
  initialValues: VenueFormValues,
  onSubmit: (values: VenueFormValues) => Promise<unknown>,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<VenueFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(
    <TKey extends keyof VenueFormValues>(key: TKey, value: VenueFormValues[TKey]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateVenueForm(values);
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

  return {
    errors,
    isSubmitting,
    reset: () => {
      setValues(initialValues);
      setErrors({});
    },
    setField,
    submit,
    values,
  };
}
