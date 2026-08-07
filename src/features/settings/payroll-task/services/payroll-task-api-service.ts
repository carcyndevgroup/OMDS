import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createPayrollTask,
  findPayrollTask,
  listPayrollTasks,
  updatePayrollTask,
} from "../repositories/payroll-task-repository";
import type { PayrollTaskFormValues } from "../types/payroll-task";

export async function createPayrollTaskApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: PayrollTaskFormValues) => createPayrollTask(client, values),
    find: (id: string) => findPayrollTask(client, id),
    list: () => listPayrollTasks(client),
    update: (id: string, values: PayrollTaskFormValues) =>
      updatePayrollTask(client, id, values),
  };
}
