import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { listEvents } from "../repositories/event-list-query";
import { findEventDetail } from "../repositories/event-query";

export async function createEventApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    find: (id: string) => findEventDetail(client, id),
    list: () => listEvents(client),
  };
}
