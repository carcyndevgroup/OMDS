import type { TranslationKey } from "@/core/i18n";

import type { ExpenseCategoryFormValues } from "../types/expense-category";

export type ExpenseCategoryErrors = Partial<
  Record<keyof ExpenseCategoryFormValues, TranslationKey>
>;

export const initialExpenseCategoryValues: ExpenseCategoryFormValues = {
  isActive: true,
  name: "",
  sortOrder: "0",
};

export function validateExpenseCategory(values: ExpenseCategoryFormValues) {
  const errors: ExpenseCategoryErrors = {};
  if (!values.name.trim()) errors.name = "settings.product.validation.required";
  if (values.sortOrder === "" || Number(values.sortOrder) < 0) {
    errors.sortOrder = "settings.product.validation.amount";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
