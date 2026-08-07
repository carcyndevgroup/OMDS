import type { EventPayrollLineItemFormValues } from "../types/event-payroll-line-item";
import { initialEventPayrollLineItemValues } from "./event-payroll-line-item-schema";

const read = (source: unknown, key: keyof EventPayrollLineItemFormValues) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseEventPayrollLineItemValues(source: unknown): EventPayrollLineItemFormValues {
  return {
    eventStaffAssignmentId: read(source, "eventStaffAssignmentId"),
    manualAdjustmentMxn: read(source, "manualAdjustmentMxn") || "0",
    notes: read(source, "notes"),
    payrollTaskId: read(source, "payrollTaskId"),
    quantity: read(source, "quantity") || "1",
    staffMemberId: read(source, "staffMemberId"),
    status: (read(source, "status") || initialEventPayrollLineItemValues.status) as EventPayrollLineItemFormValues["status"],
    tipsBonusMxn: read(source, "tipsBonusMxn") || "0",
  };
}
