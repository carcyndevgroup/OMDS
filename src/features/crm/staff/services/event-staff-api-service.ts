import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { EventStaffFormValues } from "../types/staff";
import {
  deleteEventStaffAssignment,
  listEventStaffAssignments,
  upsertEventStaffAssignment,
} from "../repositories/event-staff-repository";
import {
  deleteEstimatedPayrollForStaffAssignment,
  syncEventStaffAssignmentPayroll,
} from "../repositories/event-staff-payroll-sync-repository";

export async function createEventStaffApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    delete: async (eventId: string, assignmentId: string) => {
      await deleteEstimatedPayrollForStaffAssignment(client, eventId, assignmentId);
      return deleteEventStaffAssignment(client, eventId, assignmentId);
    },
    list: (eventId: string) => listEventStaffAssignments(client, eventId),
    upsert: async (eventId: string, values: EventStaffFormValues) => {
      const assignmentId = await upsertEventStaffAssignment(client, eventId, values);
      await syncEventStaffAssignmentPayroll(client, eventId, assignmentId);
      return assignmentId;
    },
  };
}
