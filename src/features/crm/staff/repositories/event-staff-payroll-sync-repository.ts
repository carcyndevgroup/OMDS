import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { StaffPosition } from "../types/staff";

type AssignmentRow =
  Database["public"]["Tables"]["event_staff_assignments"]["Row"];
type EventRow = Pick<
  Database["public"]["Tables"]["events"]["Row"],
  "service_end_time" | "service_start_time"
>;
type TaskRow = Database["public"]["Tables"]["payroll_task_catalog"]["Row"];
type PayrollStatus =
  Database["public"]["Tables"]["event_payroll_line_items"]["Row"]["status"];

const autoEditableStatuses: PayrollStatus[] = ["estimated"];
const driverPositions = new Set<StaffPosition>(["driver_a", "driver_b"]);

const positionTaskKeys: Partial<Record<StaffPosition, string>> = {
  driver_a: "driver_a_direction",
  driver_b: "driver_b_direction",
  operator_1: "operator_1",
  operator_2: "operator_2",
  operator_3: "operator_3",
  operator_4: "operator_4",
  operator_5: "operator_5",
  operator_6: "operator_6",
};

const parseTimeMinutes = (value: string | null) => {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const serviceHours = (event: EventRow) => {
  const start = parseTimeMinutes(event.service_start_time);
  const end = parseTimeMinutes(event.service_end_time);
  if (start === null || end === null) return 6;

  const minutes = end > start ? end - start : end + 1440 - start;
  return Math.max(0.25, Number((minutes / 60).toFixed(2)));
};

async function getAssignment(
  database: SupabaseClient<Database>,
  eventId: string,
  assignmentId: string,
) {
  const result = await database
    .from("event_staff_assignments")
    .select("*")
    .eq("event_id", eventId)
    .eq("id", assignmentId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data as AssignmentRow | null;
}

async function getEvent(database: SupabaseClient<Database>, eventId: string) {
  const result = await database
    .from("events")
    .select("service_start_time, service_end_time")
    .eq("id", eventId)
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) throw new Error("event_not_found");
  return result.data;
}

async function getTask(database: SupabaseClient<Database>, taskKey: string) {
  const result = await database
    .from("payroll_task_catalog")
    .select("*")
    .eq("task_key", taskKey)
    .eq("is_active", true)
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) throw new Error("payroll_task_not_found");
  return result.data as TaskRow;
}

const quantityFor = (position: StaffPosition, event: EventRow) =>
  driverPositions.has(position) ? 1 : serviceHours(event);

const payrollPayload = (
  eventId: string,
  assignment: AssignmentRow,
  task: TaskRow,
  quantity: number,
) => ({
  additional_unit_amount_mxn: task.additional_unit_amount_mxn,
  event_id: eventId,
  event_staff_assignment_id: assignment.id,
  included_quantity: task.included_quantity,
  notes: assignment.notes,
  overtime_rate_mxn: task.overtime_rate_mxn,
  pay_rule: task.pay_rule,
  payroll_task_id: task.id,
  quantity,
  rate_mxn: task.base_amount_mxn,
  source: "auto_staffing",
  staff_member_id: assignment.staff_member_id,
  status: "estimated",
  task_category: task.category,
  task_name: task.name,
});

export async function syncEventStaffAssignmentPayroll(
  database: SupabaseClient<Database>,
  eventId: string,
  assignmentId: string,
) {
  const assignment = await getAssignment(database, eventId, assignmentId);
  if (!assignment) return;

  const taskKey = positionTaskKeys[assignment.position as StaffPosition];
  if (!taskKey) return;

  const [event, task] = await Promise.all([
    getEvent(database, eventId),
    getTask(database, taskKey),
  ]);

  const existing = await database
    .from("event_payroll_line_items")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("event_staff_assignment_id", assignmentId)
    .eq("source", "auto_staffing")
    .maybeSingle();

  if (existing.error) throw existing.error;

  const payload = payrollPayload(
    eventId,
    assignment,
    task,
    quantityFor(assignment.position as StaffPosition, event),
  );

  if (existing.data) {
    if (!autoEditableStatuses.includes(existing.data.status)) return;
    const result = await database
      .from("event_payroll_line_items")
      .update(payload)
      .eq("id", existing.data.id);
    if (result.error) throw result.error;
    return;
  }

  const result = await database.from("event_payroll_line_items").insert(payload);
  if (result.error) throw result.error;
}

export async function deleteEstimatedPayrollForStaffAssignment(
  database: SupabaseClient<Database>,
  eventId: string,
  assignmentId: string,
) {
  const result = await database
    .from("event_payroll_line_items")
    .delete()
    .eq("event_id", eventId)
    .eq("event_staff_assignment_id", assignmentId)
    .eq("source", "auto_staffing")
    .eq("status", "estimated");

  if (result.error) throw result.error;
}
