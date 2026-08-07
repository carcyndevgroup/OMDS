import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { listEventSatFacturas } from "../repositories/event-sat-factura-repository";

export async function createEventSatFacturaApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    list: (eventId: string) => listEventSatFacturas(client, eventId),
  };
}
