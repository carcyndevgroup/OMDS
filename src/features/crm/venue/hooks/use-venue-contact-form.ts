import { useCallback, useState } from "react";

import {
  validateVenueContactForm,
  type VenueContactFormErrors,
} from "../schemas/venue-contact-schema";
import type { VenueContactFormValues } from "../types/venue-contact";

export function useVenueContactForm(
  initialValues: VenueContactFormValues,
  onSubmit: (values: VenueContactFormValues) => Promise<void>,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<VenueContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(
    <TKey extends keyof VenueContactFormValues>(
      key: TKey,
      value: VenueContactFormValues[TKey],
    ) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateVenueContactForm(values);
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
