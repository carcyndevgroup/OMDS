import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  ExpenseCategory,
  ExpenseCategoryFormValues,
} from "../types/expense-category";

type ExpenseCategoryRow =
  Database["public"]["Tables"]["expense_categories"]["Row"];

const toCategory = (row: ExpenseCategoryRow): ExpenseCategory => ({
  id: row.id,
  isActive: row.is_active,
  name: row.name,
  sortOrder: String(row.sort_order),
});

const toPayload = (values: ExpenseCategoryFormValues) => ({
  is_active: values.isActive,
  name: values.name.trim(),
  sort_order: Number(values.sortOrder),
});

export async function listExpenseCategories(
  database: SupabaseClient<Database>,
) {
  const result = await database
    .from("expense_categories")
    .select("*")
    .order("sort_order")
    .order("name");

  if (result.error) throw result.error;
  return result.data.map(toCategory);
}

export async function createExpenseCategory(
  database: SupabaseClient<Database>,
  values: ExpenseCategoryFormValues,
) {
  const result = await database
    .from("expense_categories")
    .insert(toPayload(values))
    .select("*")
    .single();

  if (result.error) throw result.error;
  return toCategory(result.data);
}

export async function updateExpenseCategory(
  database: SupabaseClient<Database>,
  id: string,
  values: ExpenseCategoryFormValues,
) {
  const result = await database
    .from("expense_categories")
    .update(toPayload(values))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? toCategory(result.data) : null;
}
