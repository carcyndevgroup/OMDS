import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { initialSigningProfile } from "../schemas/signing-profile-schema";
import type { SigningProfile } from "../types/signing-profile";

type SigningProfileRow = Database["public"]["Tables"]["app_signing_profile_settings"]["Row"];

const toSettings = (row: SigningProfileRow): SigningProfile => ({
  authorizedSignerFullName: row.authorized_signer_full_name,
  authorizedSignerTitle: row.authorized_signer_title,
});

const toPayload = (values: SigningProfile) => ({
  authorized_signer_full_name: values.authorizedSignerFullName.trim(),
  authorized_signer_title: values.authorizedSignerTitle.trim(),
  id: true,
});

export async function getSigningProfile(database: SupabaseClient<Database>) {
  const result = await database
    .from("app_signing_profile_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (result.error) throw result.error;
  if (result.data) return toSettings(result.data);

  return updateSigningProfile(database, initialSigningProfile);
}

export async function updateSigningProfile(
  database: SupabaseClient<Database>,
  values: SigningProfile,
) {
  const result = await database
    .from("app_signing_profile_settings")
    .upsert(toPayload(values), { onConflict: "id" })
    .select("*")
    .single();

  if (result.error) throw result.error;
  return toSettings(result.data);
}
