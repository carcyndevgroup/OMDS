import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EventExpense,
  EventExpenseFormValues,
  EventExpenseStatus,
} from "../types/event-expense";

type ExpenseRow = Database["public"]["Tables"]["event_expenses"]["Row"];
type CategoryRow = Pick<
  Database["public"]["Tables"]["expense_categories"]["Row"],
  "id" | "name"
>;

const toMoney = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const expensePayload = (eventId: string, values: EventExpenseFormValues) => ({
  amount_mxn: toMoney(values.amountMxn),
  description: values.description.trim(),
  event_id: eventId,
  expense_category_id: values.categoryId || null,
  notes: values.notes.trim(),
  status: values.status,
  vendor_name: values.vendorName.trim(),
});

const mapExpense = (
  row: ExpenseRow,
  categories: Map<string, CategoryRow>,
): EventExpense => {
  const category = row.expense_category_id
    ? categories.get(row.expense_category_id)
    : undefined;

  return {
    amountMxn: String(row.amount_mxn),
    categoryId: row.expense_category_id ?? "",
    categoryName: category?.name ?? "",
    description: row.description,
    id: row.id,
    notes: row.notes,
    status: row.status as EventExpenseStatus,
    vendorName: row.vendor_name,
  };
};

export async function listEventExpenses(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const expenses = await database
    .from("event_expenses")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (expenses.error) throw expenses.error;
  if (!expenses.data.length) return [];

  const categoryIds = expenses.data
    .map((expense) => expense.expense_category_id)
    .filter((id): id is string => Boolean(id));
  const categories = categoryIds.length
    ? await database.from("expense_categories").select("id, name").in("id", categoryIds)
    : { data: [], error: null };

  if (categories.error) throw categories.error;

  return expenses.data.map((expense) => mapExpense(
    expense,
    new Map(categories.data.map((category) => [category.id, category])),
  ));
}

export async function createEventExpense(
  database: SupabaseClient<Database>,
  eventId: string,
  values: EventExpenseFormValues,
) {
  const result = await database
    .from("event_expenses")
    .insert(expensePayload(eventId, values))
    .select("id")
    .single();

  if (result.error) throw result.error;
  return result.data.id;
}

export async function updateEventExpense(
  database: SupabaseClient<Database>,
  eventId: string,
  expenseId: string,
  values: EventExpenseFormValues,
) {
  const result = await database
    .from("event_expenses")
    .update(expensePayload(eventId, values))
    .eq("event_id", eventId)
    .eq("id", expenseId)
    .select("id")
    .single();

  if (result.error) throw result.error;
  return result.data.id;
}

export async function deleteEventExpense(
  database: SupabaseClient<Database>,
  eventId: string,
  expenseId: string,
) {
  const result = await database
    .from("event_expenses")
    .delete()
    .eq("event_id", eventId)
    .eq("id", expenseId);

  if (result.error) throw result.error;
}
