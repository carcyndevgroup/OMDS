import { useCallback, useState } from "react";

import {
  validatePaymentPlanForm,
  type PaymentPlanFormErrors,
} from "../schemas/payment-plan-schema";
import type { PaymentPlanFormValues } from "../types/payment-plan";

export function usePaymentPlanForm(
  initialValues: PaymentPlanFormValues,
  onSubmit: (values: PaymentPlanFormValues) => Promise<void>,
) {
  const [errors, setErrors] = useState<PaymentPlanFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(
    <TKey extends keyof PaymentPlanFormValues>(
      key: TKey,
      value: PaymentPlanFormValues[TKey],
    ) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validatePaymentPlanForm(values);
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
