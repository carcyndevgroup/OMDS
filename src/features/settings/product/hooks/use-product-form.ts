import { useCallback, useState } from "react";

import {
  validateProductForm,
  type ProductFormErrors,
} from "../schemas/product-schema";
import type { ProductFormValues } from "../types/product";

export function useProductForm(
  initialValues: ProductFormValues,
  onSubmit: (values: ProductFormValues) => Promise<void>,
) {
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(
    <TKey extends keyof ProductFormValues>(
      key: TKey,
      value: ProductFormValues[TKey],
    ) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const submit = async () => {
    const validation = validateProductForm(values);
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
