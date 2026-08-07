import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  FinalDueRule,
  PaymentPlan,
  PaymentPlanFormValues,
  RetainerDueRule,
} from "../types/payment-plan";

type PaymentPlanRow = Database["public"]["Tables"]["payment_plans"]["Row"];

const percent = (value: number) => Number(value).toFixed(2);

const toPaymentPlan = (row: PaymentPlanRow): PaymentPlan => ({
  allowAdjustedFinalBalance: row.allow_adjusted_final_balance,
  createdAt: row.created_at,
  finalDueDaysBeforeEvent: String(row.final_due_days_before_event),
  finalDueRule: row.final_due_rule as FinalDueRule,
  finalPaymentPercent: percent(row.final_payment_percent),
  id: row.id,
  isActive: row.is_active,
  isDefault: row.is_default,
  name: row.name,
  refundNotes: row.refund_notes,
  retainerDueRule: row.retainer_due_rule as RetainerDueRule,
  retainerGracePeriodDays: String(row.retainer_grace_period_days),
  retainerPercent: percent(row.retainer_percent),
  updatedAt: row.updated_at,
});

const toPayload = (values: PaymentPlanFormValues) => ({
  allow_adjusted_final_balance: values.allowAdjustedFinalBalance,
  final_due_days_before_event: Number(values.finalDueDaysBeforeEvent),
  final_due_rule: values.finalDueRule,
  final_payment_percent: Number(values.finalPaymentPercent),
  is_active: values.isActive,
  is_default: values.isDefault,
  name: values.name.trim(),
  refund_notes: values.refundNotes.trim(),
  retainer_due_rule: values.retainerDueRule,
  retainer_grace_period_days: Number(values.retainerGracePeriodDays),
  retainer_percent: Number(values.retainerPercent),
});

export async function createPaymentPlan(
  database: SupabaseClient<Database>,
  values: PaymentPlanFormValues,
) {
  const result = await database
    .from("payment_plans")
    .insert(toPayload(values))
    .select("*")
    .single();
  if (result.error) throw result.error;
  return toPaymentPlan(result.data);
}

export async function findPaymentPlan(database: SupabaseClient<Database>, id: string) {
  const result = await database
    .from("payment_plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toPaymentPlan(result.data) : null;
}

export async function listPaymentPlans(database: SupabaseClient<Database>) {
  const result = await database
    .from("payment_plans")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name");
  if (result.error) throw result.error;
  return result.data.map(toPaymentPlan);
}

export async function updatePaymentPlan(
  database: SupabaseClient<Database>,
  id: string,
  values: PaymentPlanFormValues,
) {
  const result = await database
    .from("payment_plans")
    .update(toPayload(values))
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toPaymentPlan(result.data) : null;
}
