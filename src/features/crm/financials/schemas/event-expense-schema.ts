import type { TranslationKey } from "@/core/i18n";

import type { EventExpenseFormValues } from "../types/event-expense";

export type EventExpenseErrors = Partial<
  Record<keyof EventExpenseFormValues, TranslationKey>
>;

export const initialEventExpenseValues: EventExpenseFormValues = {
  amountMxn: "0",
  categoryId: "",
  description: "",
  notes: "",
  status: "estimated",
  vendorName: "",
};

export function validateEventExpense(values: EventExpenseFormValues) {
  const errors: EventExpenseErrors = {};
  if (!values.description.trim()) errors.description = "crm.quote.validation.required";
  if (values.amountMxn === "" || Number(values.amountMxn) < 0) {
    errors.amountMxn = "crm.quote.validation.money";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
