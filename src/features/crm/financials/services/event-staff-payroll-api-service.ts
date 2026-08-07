import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  deleteEventStaffPayroll,
  listEventStaffPayroll,
  upsertEventStaffPayroll,
} from "../repositories/event-staff-payroll-repository";
import type { EventStaffPayrollFormValues } from "../types/event-staff-payroll";

export async function createEventStaffPayrollApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    delete: (eventId: string, payrollId: string) =>
      deleteEventStaffPayroll(client, eventId, payrollId),
    list: (eventId: string) => listEventStaffPayroll(client, eventId),
    upsert: (eventId: string, values: EventStaffPayrollFormValues) =>
      upsertEventStaffPayroll(client, eventId, values),
  };
}
