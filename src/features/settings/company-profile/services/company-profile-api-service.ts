import { createServerSupabaseClient } from "@/core/supabase/server-client";

import { getCompanyProfile, updateCompanyProfile } from "../repositories/company-profile-repository";
import type { CompanyProfile } from "../types/company-profile";

export async function createCompanyProfileApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    get: () => getCompanyProfile(client),
    update: (values: CompanyProfile) => updateCompanyProfile(client, values),
  };
}
