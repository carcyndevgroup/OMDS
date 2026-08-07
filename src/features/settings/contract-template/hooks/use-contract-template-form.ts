import { useCallback, useState } from "react";

import {
  validateContractTemplateForm,
  type ContractTemplateFormErrors,
} from "../schemas/contract-template-schema";
import type { ContractTemplateFormValues } from "../types/contract-template";

export function useContractTemplateForm(
  initialValues: ContractTemplateFormValues,
  onSubmit: (values: ContractTemplateFormValues) => Promise<void>,
) {
  const [errors, setErrors] = useState<ContractTemplateFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(
    <TKey extends keyof ContractTemplateFormValues>(key: TKey, value: ContractTemplateFormValues[TKey]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateContractTemplateForm(values);
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
