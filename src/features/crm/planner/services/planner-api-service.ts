import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { createSupabasePlannerRepository } from "../repositories/supabase-planner-repository";
import { createPlannerService } from "./planner-service";

export async function createPlannerApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;
  return createPlannerService(createSupabasePlannerRepository(client));
}
