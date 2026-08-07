import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  VenueContact,
  VenueContactFormValues,
} from "../types/venue-contact";
import type { VenueContactRepository } from "./venue-contact-repository";

type VenueContactRow = Database["public"]["Tables"]["venue_contacts"]["Row"];

const toVenueContact = (row: VenueContactRow): VenueContact => ({
  createdAt: row.created_at,
  email: row.email,
  id: row.id,
  isActive: row.is_active,
  name: row.name,
  notes: row.notes,
  phone: row.phone,
  preferredContactMethod: row.preferred_contact_method,
  role: row.role,
  updatedAt: row.updated_at,
  venueId: row.venue_id,
  whatsapp: row.whatsapp,
});

const toPayload = (venueId: string, values: VenueContactFormValues) => ({
  email: values.email.trim(),
  is_active: values.isActive,
  name: values.name.trim(),
  notes: values.notes.trim(),
  phone: values.phone.trim(),
  preferred_contact_method: values.preferredContactMethod,
  role: values.role,
  venue_id: venueId,
  whatsapp: values.whatsapp.trim(),
});

export function createSupabaseVenueContactRepository(
  client: SupabaseClient<Database>,
): VenueContactRepository {
  return {
    async create(venueId, values) {
      const result = await client
        .from("venue_contacts")
        .insert(toPayload(venueId, values))
        .select("*")
        .single();

      if (result.error) throw result.error;
      return toVenueContact(result.data);
    },
    async listByVenue(venueId) {
      const result = await client
        .from("venue_contacts")
        .select("*")
        .eq("venue_id", venueId)
        .order("is_active", { ascending: false })
        .order("name");

      if (result.error) throw result.error;
      return result.data.map(toVenueContact);
    },
    async update(venueId, contactId, values) {
      const result = await client
        .from("venue_contacts")
        .update(toPayload(venueId, values))
        .eq("venue_id", venueId)
        .eq("id", contactId)
        .select("*")
        .maybeSingle();

      if (result.error) throw result.error;
      return result.data ? toVenueContact(result.data) : null;
    },
  };
}
