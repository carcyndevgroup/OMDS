import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createExpenseCategory,
  listExpenseCategories,
  updateExpenseCategory,
} from "../repositories/expense-category-repository";
import type { ExpenseCategoryFormValues } from "../types/expense-category";

export async function createExpenseCategoryApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: ExpenseCategoryFormValues) => createExpenseCategory(client, values),
    list: () => listExpenseCategories(client),
    update: (id: string, values: ExpenseCategoryFormValues) =>
      updateExpenseCategory(client, id, values),
  };
}
