import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { initialCompanyProfile } from "../schemas/company-profile-schema";
import type { CompanyProfile } from "../types/company-profile";

type CompanyProfileRow = Database["public"]["Tables"]["app_company_profile_settings"]["Row"];

const toSettings = (row: CompanyProfileRow): CompanyProfile => ({
  legalName: row.legal_name,
  dbaName: row.dba_name,
  address: row.address,
  phone: row.phone,
  email: row.email,
  website: row.website,
});

const toPayload = (values: CompanyProfile) => ({
  legal_name: values.legalName.trim(),
  dba_name: values.dbaName.trim(),
  address: values.address.trim(),
  phone: values.phone.trim(),
  email: values.email.trim(),
  website: values.website.trim(),
  id: true,
});

export async function getCompanyProfile(database: SupabaseClient<Database>) {
  const result = await database
    .from("app_company_profile_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (result.error) throw result.error;
  if (result.data) return toSettings(result.data);

  return updateCompanyProfile(database, initialCompanyProfile);
}

export async function updateCompanyProfile(
  database: SupabaseClient<Database>,
  values: CompanyProfile,
) {
  const result = await database
    .from("app_company_profile_settings")
    .upsert(toPayload(values), { onConflict: "id" })
    .select("*")
    .single();

  if (result.error) throw result.error;
  return toSettings(result.data);
}
