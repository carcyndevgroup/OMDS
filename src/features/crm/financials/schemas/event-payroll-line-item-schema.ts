import type { TranslationKey } from "@/core/i18n";

import type { EventPayrollLineItemFormValues } from "../types/event-payroll-line-item";

export type EventPayrollLineItemErrors = Partial<
  Record<keyof EventPayrollLineItemFormValues, TranslationKey>
>;

export const initialEventPayrollLineItemValues: EventPayrollLineItemFormValues = {
  eventStaffAssignmentId: "",
  manualAdjustmentMxn: "0",
  notes: "",
  payrollTaskId: "",
  quantity: "1",
  staffMemberId: "",
  status: "estimated",
  tipsBonusMxn: "0",
};

const validNumber = (value: string, allowNegative = false) => {
  const amount = Number(value);
  return Number.isFinite(amount) && (allowNegative || amount >= 0);
};

export function validateEventPayrollLineItem(values: EventPayrollLineItemFormValues) {
  const errors: EventPayrollLineItemErrors = {};
  if (!values.staffMemberId) errors.staffMemberId = "crm.quote.validation.required";
  if (!values.payrollTaskId) errors.payrollTaskId = "crm.quote.validation.required";
  if (!validNumber(values.quantity)) errors.quantity = "crm.quote.validation.money";
  if (!validNumber(values.manualAdjustmentMxn, true)) errors.manualAdjustmentMxn = "crm.quote.validation.money";
  if (!validNumber(values.tipsBonusMxn)) errors.tipsBonusMxn = "crm.quote.validation.money";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
