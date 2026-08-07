import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EventPayrollLineItem,
  EventPayrollLineItemFormValues,
  EventPayrollLineItemSource,
  EventPayrollLineItemStatus,
} from "../types/event-payroll-line-item";

type LineItemRow = Database["public"]["Tables"]["event_payroll_line_items"]["Row"];
type StaffRow = Pick<Database["public"]["Tables"]["staff_members"]["Row"], "display_name" | "id" | "name">;
type TaskRow = Database["public"]["Tables"]["payroll_task_catalog"]["Row"];

const money = (value: number) => Number(value).toFixed(2);
const numeric = (value: string) => Number(value || 0);

const toLineItem = (row: LineItemRow, staff: Map<string, StaffRow>): EventPayrollLineItem => {
  const member = staff.get(row.staff_member_id);

  return {
    calculatedAmountMxn: money(row.calculated_amount_mxn),
    eventStaffAssignmentId: row.event_staff_assignment_id ?? "",
    id: row.id,
    manualAdjustmentMxn: money(row.manual_adjustment_mxn),
    notes: row.notes,
    payrollTaskId: row.payroll_task_id ?? "",
    quantity: String(Number(row.quantity)),
    staffMemberId: row.staff_member_id,
    staffName: member?.display_name || member?.name || "",
    status: row.status as EventPayrollLineItemStatus,
    source: row.source as EventPayrollLineItemSource,
    taskName: row.task_name,
    tipsBonusMxn: money(row.tips_bonus_mxn),
    totalMxn: money(row.total_mxn),
  };
};

async function getTask(database: SupabaseClient<Database>, taskId: string) {
  const result = await database
    .from("payroll_task_catalog")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) throw new Error("payroll_task_not_found");
  return result.data as TaskRow;
}

const payload = (eventId: string, values: EventPayrollLineItemFormValues, task: TaskRow) => ({
  additional_unit_amount_mxn: task.additional_unit_amount_mxn,
  event_id: eventId,
  event_staff_assignment_id: values.eventStaffAssignmentId || null,
  included_quantity: task.included_quantity,
  manual_adjustment_mxn: numeric(values.manualAdjustmentMxn),
  notes: values.notes.trim(),
  overtime_rate_mxn: task.overtime_rate_mxn,
  pay_rule: task.pay_rule,
  payroll_task_id: task.id,
  quantity: numeric(values.quantity),
  rate_mxn: task.base_amount_mxn,
  source: "manual",
  staff_member_id: values.staffMemberId,
  status: values.status,
  task_category: task.category,
  task_name: task.name,
  tips_bonus_mxn: numeric(values.tipsBonusMxn),
});

export async function listEventPayrollLineItems(database: SupabaseClient<Database>, eventId: string) {
  const lineItems = await database
    .from("event_payroll_line_items")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (lineItems.error) throw lineItems.error;
  if (!lineItems.data.length) return [];

  const staffIds = Array.from(new Set(lineItems.data.map((row) => row.staff_member_id)));
  const staff = await database
    .from("staff_members")
    .select("id, display_name, name")
    .in("id", staffIds);

  if (staff.error) throw staff.error;

  const staffMap = new Map((staff.data as StaffRow[]).map((row) => [row.id, row]));
  return lineItems.data.map((row) => toLineItem(row, staffMap));
}

export async function createEventPayrollLineItem(database: SupabaseClient<Database>, eventId: string, values: EventPayrollLineItemFormValues) {
  const task = await getTask(database, values.payrollTaskId);
  const result = await database.from("event_payroll_line_items").insert(payload(eventId, values, task)).select("id").single();
  if (result.error) throw result.error;
  return result.data.id;
}

export async function updateEventPayrollLineItem(database: SupabaseClient<Database>, eventId: string, lineItemId: string, values: EventPayrollLineItemFormValues) {
  const task = await getTask(database, values.payrollTaskId);
  const result = await database
    .from("event_payroll_line_items")
    .update(payload(eventId, values, task))
    .eq("event_id", eventId)
    .eq("id", lineItemId)
    .select("id")
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data?.id ?? null;
}

export async function deleteEventPayrollLineItem(database: SupabaseClient<Database>, eventId: string, lineItemId: string) {
  const result = await database
    .from("event_payroll_line_items")
    .delete()
    .eq("event_id", eventId)
    .eq("id", lineItemId);

  if (result.error) throw result.error;
}

export async function approveEventPayrollLineItem(
  database: SupabaseClient<Database>,
  eventId: string,
  lineItemId: string,
) {
  const result = await database
    .from("event_payroll_line_items")
    .update({ status: "approved" })
    .eq("event_id", eventId)
    .eq("id", lineItemId)
    .eq("status", "estimated")
    .select("id")
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data?.id ?? null;
}
