import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { getSigningProfile, updateSigningProfile } from "../repositories/signing-profile-repository";
import type { SigningProfile } from "../types/signing-profile";

export async function createSigningProfileApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    get: () => getSigningProfile(client),
    update: (values: SigningProfile) => updateSigningProfile(client, values),
  };
}
