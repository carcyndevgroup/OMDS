import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { createSupabaseVenueContactRepository } from "../repositories/supabase-venue-contact-repository";
import { createVenueContactService } from "./venue-contact-service";

export async function createVenueContactApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;
  return createVenueContactService(createSupabaseVenueContactRepository(client));
}
