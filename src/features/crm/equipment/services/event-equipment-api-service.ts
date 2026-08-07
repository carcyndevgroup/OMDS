import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  deleteEventEquipmentAssignment,
  listEventEquipmentAssignments,
  upsertEventEquipmentAssignment,
} from "../repositories/event-equipment-repository";
import type { EventEquipmentFormValues } from "../types/event-equipment";

export async function createEventEquipmentApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    delete: (eventId: string, assignmentId: string) =>
      deleteEventEquipmentAssignment(client, eventId, assignmentId),
    list: (eventId: string) => listEventEquipmentAssignments(client, eventId),
    upsert: (eventId: string, values: EventEquipmentFormValues) =>
      upsertEventEquipmentAssignment(client, eventId, values),
  };
}
