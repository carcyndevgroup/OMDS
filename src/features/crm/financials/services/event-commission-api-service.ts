import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createEventCommission,
  deleteEventCommission,
  listEventCommissions,
  updateEventCommission,
} from "../repositories/event-commission-repository";
import type { EventCommissionFormValues } from "../types/event-commission";

export async function createEventCommissionApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (eventId: string, values: EventCommissionFormValues) =>
      createEventCommission(client, eventId, values),
    delete: (eventId: string, commissionId: string) =>
      deleteEventCommission(client, eventId, commissionId),
    list: (eventId: string) => listEventCommissions(client, eventId),
    update: (
      eventId: string,
      commissionId: string,
      values: EventCommissionFormValues,
    ) => updateEventCommission(client, eventId, commissionId, values),
  };
}
