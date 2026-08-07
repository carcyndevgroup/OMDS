import type { TranslationKey } from "@/core/i18n";

import type { PayrollTaskFormValues } from "../types/payroll-task";

export type PayrollTaskFormErrors = Partial<Record<keyof PayrollTaskFormValues, TranslationKey>>;

export const initialPayrollTaskFormValues: PayrollTaskFormValues = {
  additionalUnitAmountMxn: "0",
  baseAmountMxn: "0",
  category: "",
  includedQuantity: "1",
  isActive: true,
  name: "",
  notes: "",
  overtimeRateMxn: "0",
  payRule: "fixed",
  sortOrder: "0",
  taskKey: "",
  unitLabel: "",
};

const validAmount = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0;
};

export function validatePayrollTask(values: PayrollTaskFormValues) {
  const errors: PayrollTaskFormErrors = {};
  if (!values.taskKey.trim()) errors.taskKey = "settings.payrollTask.validation.required";
  if (!values.name.trim()) errors.name = "settings.payrollTask.validation.required";
  if (!values.category) errors.category = "settings.payrollTask.validation.required";
  if (!values.payRule) errors.payRule = "settings.payrollTask.validation.required";
  if (!validAmount(values.baseAmountMxn)) errors.baseAmountMxn = "settings.payrollTask.validation.amount";
  if (!validAmount(values.overtimeRateMxn)) errors.overtimeRateMxn = "settings.payrollTask.validation.amount";
  if (!validAmount(values.includedQuantity)) errors.includedQuantity = "settings.payrollTask.validation.amount";
  if (!validAmount(values.additionalUnitAmountMxn)) errors.additionalUnitAmountMxn = "settings.payrollTask.validation.amount";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
