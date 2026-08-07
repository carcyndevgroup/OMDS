import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { StaffPosition } from "../../staff/types/staff";
import type {
  EventStaffPayroll,
  EventStaffPayrollFormValues,
  EventStaffPayrollStatus,
} from "../types/event-staff-payroll";

type PayrollRow = Database["public"]["Tables"]["event_staff_payroll"]["Row"];
type AssignmentRow = Pick<
  Database["public"]["Tables"]["event_staff_assignments"]["Row"],
  "id" | "position" | "staff_member_id"
>;
type StaffRow = Pick<
  Database["public"]["Tables"]["staff_members"]["Row"],
  "display_name" | "id" | "name"
>;

const toMoney = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const payrollPayload = (
  eventId: string,
  values: EventStaffPayrollFormValues,
) => ({
  amount_mxn: toMoney(values.amountMxn),
  event_id: eventId,
  event_staff_assignment_id: values.assignmentId,
  notes: values.notes.trim(),
  status: values.status,
});

const mapPayroll = (
  row: PayrollRow,
  assignments: Map<string, AssignmentRow>,
  staff: Map<string, StaffRow>,
): EventStaffPayroll => {
  const assignment = assignments.get(row.event_staff_assignment_id);
  const member = assignment ? staff.get(assignment.staff_member_id) : undefined;

  return {
    amountMxn: String(row.amount_mxn),
    assignmentId: row.event_staff_assignment_id,
    id: row.id,
    notes: row.notes,
    position: (assignment?.position ?? "other") as StaffPosition,
    staffName: member?.display_name || member?.name || "",
    status: row.status as EventStaffPayrollStatus,
  };
};

export async function listEventStaffPayroll(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const payroll = await database
    .from("event_staff_payroll")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (payroll.error) throw payroll.error;
  if (!payroll.data.length) return [];

  const assignmentIds = payroll.data.map((row) => row.event_staff_assignment_id);
  const assignments = await database
    .from("event_staff_assignments")
    .select("id, position, staff_member_id")
    .in("id", assignmentIds);

  if (assignments.error) throw assignments.error;

  const staffIds = assignments.data.map((assignment) => assignment.staff_member_id);
  const staff = staffIds.length
    ? await database
        .from("staff_members")
        .select("id, display_name, name")
        .in("id", staffIds)
    : { data: [], error: null };

  if (staff.error) throw staff.error;

  return payroll.data.map((row) => mapPayroll(
    row,
    new Map(assignments.data.map((assignment) => [assignment.id, assignment])),
    new Map(staff.data.map((member) => [member.id, member])),
  ));
}

export async function upsertEventStaffPayroll(
  database: SupabaseClient<Database>,
  eventId: string,
  values: EventStaffPayrollFormValues,
) {
  const result = await database
    .from("event_staff_payroll")
    .upsert(payrollPayload(eventId, values), {
      onConflict: "event_id,event_staff_assignment_id",
    })
    .select("id")
    .single();

  if (result.error) throw result.error;
  return result.data.id;
}

export async function deleteEventStaffPayroll(
  database: SupabaseClient<Database>,
  eventId: string,
  payrollId: string,
) {
  const result = await database
    .from("event_staff_payroll")
    .delete()
    .eq("event_id", eventId)
    .eq("id", payrollId);

  if (result.error) throw result.error;
}
