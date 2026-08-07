import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { VenueSubLocationFormValues } from "../types/venue-sub-location";
import {
  createVenueSubLocation,
  listVenueSubLocations,
  updateVenueSubLocation,
} from "../repositories/venue-sub-location-query";

export async function createVenueSubLocationApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (venueId: string, values: VenueSubLocationFormValues) =>
      createVenueSubLocation(client, venueId, values),
    listByVenue: (venueId: string) => listVenueSubLocations(client, venueId),
    update: (
      venueId: string,
      subLocationId: string,
      values: VenueSubLocationFormValues,
    ) => updateVenueSubLocation(client, venueId, subLocationId, values),
  };
}
