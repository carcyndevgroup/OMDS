import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { listPlannerEvents } from "../repositories/planner-event-query";

export async function createPlannerEventApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    listByPlanner: (plannerId: string) => listPlannerEvents(client, plannerId),
  };
}
