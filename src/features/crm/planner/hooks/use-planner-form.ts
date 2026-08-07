import { useCallback, useState } from "react";

import {
  validatePlannerForm,
  type PlannerFormErrors,
} from "../schemas/planner-schema";
import type { PlannerFormValues } from "../types/planner";

export function usePlannerForm(
  initialValues: PlannerFormValues,
  onSubmit: (values: PlannerFormValues) => Promise<unknown>,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<PlannerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(
    <TKey extends keyof PlannerFormValues>(key: TKey, value: PlannerFormValues[TKey]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validatePlannerForm(values);
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
