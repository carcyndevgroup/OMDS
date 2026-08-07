import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { createSupabaseEventPlannerRepository } from "../repositories/supabase-event-planner-repository";
import { createEventPlannerService } from "./event-planner-service";

export async function createEventPlannerApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;
  return createEventPlannerService(createSupabaseEventPlannerRepository(client));
}
