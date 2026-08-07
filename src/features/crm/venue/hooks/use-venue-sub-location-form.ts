import { useCallback, useState } from "react";

import {
  validateVenueSubLocationForm,
  type VenueSubLocationFormErrors,
} from "../schemas/venue-sub-location-schema";
import type { VenueSubLocationFormValues } from "../types/venue-sub-location";

export function useVenueSubLocationForm(
  initialValues: VenueSubLocationFormValues,
  onSubmit: (values: VenueSubLocationFormValues) => Promise<void>,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<VenueSubLocationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(
    <TKey extends keyof VenueSubLocationFormValues>(
      key: TKey,
      value: VenueSubLocationFormValues[TKey],
    ) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateVenueSubLocationForm(values);
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
