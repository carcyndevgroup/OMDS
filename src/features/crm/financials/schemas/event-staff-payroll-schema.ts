import type { TranslationKey } from "@/core/i18n";

import type { EventStaffPayrollFormValues } from "../types/event-staff-payroll";

export type EventStaffPayrollErrors = Partial<
  Record<keyof EventStaffPayrollFormValues, TranslationKey>
>;

export const initialEventStaffPayrollValues: EventStaffPayrollFormValues = {
  amountMxn: "0",
  assignmentId: "",
  notes: "",
  status: "estimated",
};

export function validateEventStaffPayroll(values: EventStaffPayrollFormValues) {
  const errors: EventStaffPayrollErrors = {};
  if (!values.assignmentId) errors.assignmentId = "crm.quote.validation.required";
  if (values.amountMxn === "" || Number(values.amountMxn) < 0) {
    errors.amountMxn = "crm.quote.validation.money";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
