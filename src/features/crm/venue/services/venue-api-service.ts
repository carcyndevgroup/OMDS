import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { createSupabaseVenueRepository } from "../repositories/supabase-venue-repository";
import { createVenueService } from "./venue-service";

export async function createVenueApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;
  return createVenueService(createSupabaseVenueRepository(client));
}
