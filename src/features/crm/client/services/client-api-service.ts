import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { createSupabaseClientRepository } from "../repositories/supabase-client-repository";
import { createClientService } from "./client-service";

export async function createClientApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return createClientService({
    repository: createSupabaseClientRepository(client),
  });
}
