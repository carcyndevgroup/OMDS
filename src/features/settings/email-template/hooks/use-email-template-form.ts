import { useCallback, useState } from "react";

import {
  validateEmailTemplateForm,
  type EmailTemplateFormErrors,
} from "../schemas/email-template-schema";
import type { EmailTemplateFormValues } from "../types/email-template";

export function useEmailTemplateForm(
  initialValues: EmailTemplateFormValues,
  onSubmit: (values: EmailTemplateFormValues) => Promise<void>,
) {
  const [errors, setErrors] = useState<EmailTemplateFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(
    <TKey extends keyof EmailTemplateFormValues>(key: TKey, value: EmailTemplateFormValues[TKey]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateEmailTemplateForm(values);
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
