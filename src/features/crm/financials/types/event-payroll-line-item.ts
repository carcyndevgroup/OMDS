export type EventPayrollLineItemStatus =
  | "approved"
  | "estimated"
  | "paid"
  | "scheduled"
  | "waived";

export type EventPayrollLineItemSource = "auto_staffing" | "manual";

export type EventPayrollLineItem = {
  calculatedAmountMxn: string;
  eventStaffAssignmentId: string;
  id: string;
  manualAdjustmentMxn: string;
  notes: string;
  payrollTaskId: string;
  quantity: string;
  staffMemberId: string;
  staffName: string;
  status: EventPayrollLineItemStatus;
  source: EventPayrollLineItemSource;
  taskName: string;
  tipsBonusMxn: string;
  totalMxn: string;
};

export type EventPayrollLineItemFormValues = {
  eventStaffAssignmentId: string;
  manualAdjustmentMxn: string;
  notes: string;
  payrollTaskId: string;
  quantity: string;
  staffMemberId: string;
  status: EventPayrollLineItemStatus;
  tipsBonusMxn: string;
};
