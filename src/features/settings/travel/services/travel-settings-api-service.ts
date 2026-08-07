import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  getTravelSettings,
  updateTravelSettings,
} from "../repositories/travel-settings-repository";
import type { TravelSettings } from "../types/travel-settings";

export async function createTravelSettingsApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    get: () => getTravelSettings(client),
    update: (values: TravelSettings) => updateTravelSettings(client, values),
  };
}
