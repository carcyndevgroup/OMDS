import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  getClientPortalAccess,
  syncClientPortalAccess,
} from "../repositories/client-portal-repository";

export async function createClientPortalApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    get: (eventId: string) => getClientPortalAccess(client, eventId),
    sync: (eventId: string) => syncClientPortalAccess(client, eventId),
  };
}
