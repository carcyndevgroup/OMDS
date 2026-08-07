import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { createSupabaseLeadRepository } from "../repositories/supabase-lead-repository";
import { createLeadService } from "./lead-service";

export async function createLeadApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return createLeadService({
    repository: createSupabaseLeadRepository(client),
  });
}
