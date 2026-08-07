import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { updateEventDetails, type EventNotesUpdateValues } from "../repositories/event-repository";

export async function updateEventNotes(
  database: SupabaseClient<Database>,
  id: string,
  values: EventNotesUpdateValues,
) {
  return updateEventDetails(database, id, values);
}
