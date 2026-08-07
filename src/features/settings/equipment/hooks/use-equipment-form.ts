import { useCallback, useState } from "react";

import {
  validateEquipmentForm,
  type EquipmentFormErrors,
} from "../schemas/equipment-schema";
import type { EquipmentFormValues } from "../types/equipment";

export function useEquipmentForm(
  initialValues: EquipmentFormValues,
  onSubmit: (values: EquipmentFormValues) => Promise<void>,
) {
  const [errors, setErrors] = useState<EquipmentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(
    <TKey extends keyof EquipmentFormValues>(
      key: TKey,
      value: EquipmentFormValues[TKey],
    ) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateEquipmentForm(values);
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
