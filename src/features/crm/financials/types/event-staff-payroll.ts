import type { StaffPosition } from "../../staff/types/staff";

export type EventStaffPayrollStatus = "approved" | "estimated" | "paid" | "waived";

export type EventStaffPayroll = {
  amountMxn: string;
  assignmentId: string;
  id: string;
  notes: string;
  position: StaffPosition;
  staffName: string;
  status: EventStaffPayrollStatus;
};

export type EventStaffPayrollFormValues = {
  amountMxn: string;
  assignmentId: string;
  notes: string;
  status: EventStaffPayrollStatus;
};
