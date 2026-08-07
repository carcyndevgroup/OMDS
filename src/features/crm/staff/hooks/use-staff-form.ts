import { useCallback, useState } from "react";

import {
  validateStaffForm,
  type StaffFormErrors,
} from "../schemas/staff-schema";
import type { StaffFormValues } from "../types/staff";

export function useStaffForm(
  initialValues: StaffFormValues,
  onSubmit: (values: StaffFormValues) => Promise<void>,
) {
  const [errors, setErrors] = useState<StaffFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(
    <TKey extends keyof StaffFormValues>(key: TKey, value: StaffFormValues[TKey]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateStaffForm(values);
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
