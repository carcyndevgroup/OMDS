import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createEventFile,
  deleteEventFile,
  listEventFiles,
} from "../repositories/event-file-repository";
import type { EventFileFormValues } from "../types/event-file";

export async function createEventFileApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (eventId: string, values: EventFileFormValues) =>
      createEventFile(client, eventId, values),
    delete: (eventId: string, fileId: string) =>
      deleteEventFile(client, eventId, fileId),
    list: (eventId: string) => listEventFiles(client, eventId),
  };
}
