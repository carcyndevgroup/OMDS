import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { PayrollTask, PayrollTaskCategory, PayrollTaskFormValues, PayrollTaskPayRule } from "../types/payroll-task";

type PayrollTaskRow = Database["public"]["Tables"]["payroll_task_catalog"]["Row"];

const money = (value: number) => Number(value).toFixed(2);
const numberString = (value: number) => String(Number(value));
const amount = (value: string) => Number(value || 0);

const toTask = (row: PayrollTaskRow): PayrollTask => ({
  additionalUnitAmountMxn: money(row.additional_unit_amount_mxn),
  baseAmountMxn: money(row.base_amount_mxn),
  category: row.category as PayrollTaskCategory,
  createdAt: row.created_at,
  id: row.id,
  includedQuantity: numberString(row.included_quantity),
  isActive: row.is_active,
  name: row.name,
  notes: row.notes,
  overtimeRateMxn: money(row.overtime_rate_mxn),
  payRule: row.pay_rule as PayrollTaskPayRule,
  sortOrder: String(row.sort_order),
  taskKey: row.task_key,
  unitLabel: row.unit_label,
  updatedAt: row.updated_at,
});

const toPayload = (values: PayrollTaskFormValues) => ({
  additional_unit_amount_mxn: amount(values.additionalUnitAmountMxn),
  base_amount_mxn: amount(values.baseAmountMxn),
  category: values.category,
  included_quantity: amount(values.includedQuantity),
  is_active: values.isActive,
  name: values.name.trim(),
  notes: values.notes.trim(),
  overtime_rate_mxn: amount(values.overtimeRateMxn),
  pay_rule: values.payRule,
  sort_order: Math.round(amount(values.sortOrder)),
  task_key: values.taskKey.trim(),
  unit_label: values.unitLabel.trim(),
});

export async function createPayrollTask(database: SupabaseClient<Database>, values: PayrollTaskFormValues) {
  const result = await database.from("payroll_task_catalog").insert(toPayload(values)).select("*").single();
  if (result.error) throw result.error;
  return toTask(result.data);
}

export async function findPayrollTask(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("payroll_task_catalog").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toTask(result.data) : null;
}

export async function listPayrollTasks(database: SupabaseClient<Database>) {
  const result = await database.from("payroll_task_catalog").select("*").order("sort_order").order("name");
  if (result.error) throw result.error;
  return result.data.map(toTask);
}

export async function updatePayrollTask(database: SupabaseClient<Database>, id: string, values: PayrollTaskFormValues) {
  const result = await database.from("payroll_task_catalog").update(toPayload(values)).eq("id", id).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toTask(result.data) : null;
}
