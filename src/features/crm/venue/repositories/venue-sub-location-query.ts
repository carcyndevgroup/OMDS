import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { VenueSubLocation } from "../types/venue-sub-location";
import type { VenueSubLocationFormValues } from "../types/venue-sub-location";

type VenueSubLocationRow =
  Database["public"]["Tables"]["venue_sub_locations"]["Row"];

const toVenueSubLocation = (
  row: VenueSubLocationRow,
): VenueSubLocation => ({
  createdAt: row.created_at,
  id: row.id,
  isActive: row.is_active,
  name: row.name,
  notes: row.notes,
  updatedAt: row.updated_at,
  venueId: row.venue_id,
});

const toPayload = (venueId: string, values: VenueSubLocationFormValues) => ({
  is_active: values.isActive,
  name: values.name.trim(),
  notes: values.notes.trim(),
  venue_id: venueId,
});

export async function createVenueSubLocation(
  database: SupabaseClient<Database>,
  venueId: string,
  values: VenueSubLocationFormValues,
) {
  const result = await database
    .from("venue_sub_locations")
    .insert(toPayload(venueId, values))
    .select("*")
    .single();

  if (result.error) throw result.error;
  return toVenueSubLocation(result.data);
}

export async function listVenueSubLocations(
  database: SupabaseClient<Database>,
  venueId: string,
): Promise<VenueSubLocation[]> {
  const result = await database
    .from("venue_sub_locations")
    .select("*")
    .eq("venue_id", venueId)
    .order("is_active", { ascending: false })
    .order("name");

  if (result.error) throw result.error;
  return result.data.map(toVenueSubLocation);
}

export async function updateVenueSubLocation(
  database: SupabaseClient<Database>,
  venueId: string,
  subLocationId: string,
  values: VenueSubLocationFormValues,
) {
  const result = await database
    .from("venue_sub_locations")
    .update(toPayload(venueId, values))
    .eq("venue_id", venueId)
    .eq("id", subLocationId)
    .select("*")
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? toVenueSubLocation(result.data) : null;
}
