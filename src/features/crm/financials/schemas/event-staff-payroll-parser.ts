import type { EventStaffPayrollFormValues } from "../types/event-staff-payroll";
import { initialEventStaffPayrollValues } from "./event-staff-payroll-schema";

const read = (source: unknown, key: keyof EventStaffPayrollFormValues) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseEventStaffPayrollValues(
  source: unknown,
): EventStaffPayrollFormValues {
  return {
    amountMxn: read(source, "amountMxn") || initialEventStaffPayrollValues.amountMxn,
    assignmentId: read(source, "assignmentId"),
    notes: read(source, "notes"),
    status: (read(source, "status") || initialEventStaffPayrollValues.status) as EventStaffPayrollFormValues["status"],
  };
}
