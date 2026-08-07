import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { EventFile, EventFileFormValues } from "../types/event-file";

type EventFileRow = Database["public"]["Tables"]["event_files"]["Row"];

export const mapEventFile = (row: EventFileRow): EventFile => ({
  createdAt: row.created_at,
  fileName: row.file_name,
  fileUrl: row.file_url,
  id: row.id,
  includeOnRunSheet: row.include_on_run_sheet,
  notes: row.notes,
});

const toPayload = (values: EventFileFormValues) => ({
  file_name: values.fileName.trim(),
  file_url: values.fileUrl.trim(),
  include_on_run_sheet: values.includeOnRunSheet,
  notes: values.notes.trim(),
});

export async function createEventFile(
  database: SupabaseClient<Database>,
  eventId: string,
  values: EventFileFormValues,
) {
  const result = await database
    .from("event_files")
    .insert({ ...toPayload(values), event_id: eventId })
    .select("*")
    .single();

  if (result.error) throw result.error;
  return mapEventFile(result.data);
}

export async function deleteEventFile(
  database: SupabaseClient<Database>,
  eventId: string,
  fileId: string,
) {
  const result = await database
    .from("event_files")
    .delete()
    .eq("event_id", eventId)
    .eq("id", fileId);

  if (result.error) throw result.error;
}

export async function listEventFiles(
  database: SupabaseClient<Database>,
  eventId: string,
  runSheetOnly = false,
) {
  let query = database.from("event_files").select("*").eq("event_id", eventId);

  if (runSheetOnly) {
    query = query.eq("include_on_run_sheet", true);
  }

  const result = await query.order("created_at");
  if (result.error) throw result.error;
  return result.data.map(mapEventFile);
}
