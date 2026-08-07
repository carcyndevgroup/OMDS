import type { TranslationKey } from "@/core/i18n";

import { productCategoryOptions } from "../constants/product-options";
import type { ProductFormValues } from "../types/product";

export type ProductFormErrors = Partial<
  Record<keyof ProductFormValues, TranslationKey>
>;

export const initialProductFormValues: ProductFormValues = {
  category: "",
  cogMxn: "0",
  description: "",
  family: "",
  isActive: true,
  isTaxable: true,
  name: "",
  notes: "",
  priceMxn: "0",
};

const hasCategory = (value: string) => {
  return productCategoryOptions.some((option) => option.value === value);
};

const isValidAmount = (value: string) => {
  return value.trim() !== "" && Number(value) >= 0;
};

export function validateProductForm(values: ProductFormValues) {
  const errors: ProductFormErrors = {};
  if (!values.name.trim()) errors.name = "settings.product.validation.required";
  if (!values.category || !hasCategory(values.category)) {
    errors.category = "settings.product.validation.required";
  }
  if (!isValidAmount(values.cogMxn)) errors.cogMxn = "settings.product.validation.amount";
  if (!isValidAmount(values.priceMxn)) errors.priceMxn = "settings.product.validation.amount";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
