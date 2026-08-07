import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createEventExpense,
  deleteEventExpense,
  listEventExpenses,
  updateEventExpense,
} from "../repositories/event-expense-repository";
import type { EventExpenseFormValues } from "../types/event-expense";

export async function createEventExpenseApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (eventId: string, values: EventExpenseFormValues) =>
      createEventExpense(client, eventId, values),
    delete: (eventId: string, expenseId: string) =>
      deleteEventExpense(client, eventId, expenseId),
    list: (eventId: string) => listEventExpenses(client, eventId),
    update: (eventId: string, expenseId: string, values: EventExpenseFormValues) =>
      updateEventExpense(client, eventId, expenseId, values),
  };
}
