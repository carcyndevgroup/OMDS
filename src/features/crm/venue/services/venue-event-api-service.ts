import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { listVenueEvents } from "../repositories/venue-event-query";

export async function createVenueEventApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    listByVenue: (venueId: string) => listVenueEvents(client, venueId),
  };
}
