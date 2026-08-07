"use client";

import { useCallback, useState } from "react";

import { validatePayrollTask, type PayrollTaskFormErrors } from "../schemas/payroll-task-schema";
import type { PayrollTaskFormValues } from "../types/payroll-task";

export function usePayrollTaskForm(initialValues: PayrollTaskFormValues, onSubmit: (values: PayrollTaskFormValues) => Promise<void>) {
  const [errors, setErrors] = useState<PayrollTaskFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(<TKey extends keyof PayrollTaskFormValues>(key: TKey, value: PayrollTaskFormValues[TKey]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }, []);

  const submit = async () => {
    const validation = validatePayrollTask(values);
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
