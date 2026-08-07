import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  SatBankAccount,
  SatBankAccountFormValues,
  SatFiscalProfile,
  SatFiscalProfileFormValues,
  SatSettings,
} from "../types/sat-settings";

type FiscalProfileRow = Database["public"]["Tables"]["sat_fiscal_profiles"]["Row"];
type BankAccountRow = Database["public"]["Tables"]["sat_bank_accounts"]["Row"];

const toFiscalProfile = (row: FiscalProfileRow): SatFiscalProfile => ({
  constanciaFileUrl: row.constancia_file_url,
  id: row.id,
  isActive: row.is_active,
  label: row.label,
  legalName: row.legal_name,
  opinionExpiresAt: row.opinion_expires_at,
  opinionFileUrl: row.opinion_file_url,
  rfc: row.rfc,
  taxRegime: row.tax_regime,
});

const toBankAccount = (
  row: BankAccountRow,
  profileLabels: Map<string, string>,
): SatBankAccount => ({
  accountNumber: row.account_number,
  bankName: row.bank_name,
  beneficiaryName: row.beneficiary_name,
  clabe: row.clabe,
  currency: row.currency,
  fiscalProfileId: row.fiscal_profile_id,
  fiscalProfileLabel: row.fiscal_profile_id
    ? profileLabels.get(row.fiscal_profile_id) ?? ""
    : "",
  id: row.id,
  isActive: row.is_active,
  nickname: row.nickname,
});

const nullable = (value: string) => value.trim() || null;

const toFiscalProfilePayload = (values: SatFiscalProfileFormValues) => ({
  constancia_file_url: values.constanciaFileUrl.trim(),
  is_active: values.isActive,
  label: values.label.trim(),
  legal_name: values.legalName.trim(),
  opinion_expires_at: nullable(values.opinionExpiresAt),
  opinion_file_url: values.opinionFileUrl.trim(),
  rfc: values.rfc.trim().toUpperCase(),
  tax_regime: values.taxRegime.trim(),
});

const toBankAccountPayload = (values: SatBankAccountFormValues) => ({
  account_number: values.accountNumber.trim(),
  bank_name: values.bankName.trim(),
  beneficiary_name: values.beneficiaryName.trim(),
  clabe: values.clabe.trim(),
  currency: values.currency,
  fiscal_profile_id: nullable(values.fiscalProfileId),
  is_active: values.isActive,
  nickname: values.nickname.trim(),
});

export async function getSatSettings(
  database: SupabaseClient<Database>,
): Promise<SatSettings> {
  const profiles = await database
    .from("sat_fiscal_profiles")
    .select("*")
    .order("label");

  if (profiles.error) throw profiles.error;

  const accounts = await database
    .from("sat_bank_accounts")
    .select("*")
    .order("nickname");

  if (accounts.error) throw accounts.error;

  const profileLabels = new Map(
    profiles.data.map((profile) => [profile.id, profile.label]),
  );

  return {
    bankAccounts: accounts.data.map((account) =>
      toBankAccount(account, profileLabels),
    ),
    fiscalProfiles: profiles.data.map(toFiscalProfile),
  };
}

export async function createFiscalProfile(
  database: SupabaseClient<Database>,
  values: SatFiscalProfileFormValues,
) {
  const result = await database
    .from("sat_fiscal_profiles")
    .insert(toFiscalProfilePayload(values))
    .select("*")
    .single();
  if (result.error) throw result.error;
  return toFiscalProfile(result.data);
}

export async function findFiscalProfile(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("sat_fiscal_profiles").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toFiscalProfile(result.data) : null;
}

export async function updateFiscalProfile(
  database: SupabaseClient<Database>,
  id: string,
  values: SatFiscalProfileFormValues,
) {
  const result = await database
    .from("sat_fiscal_profiles")
    .update(toFiscalProfilePayload(values))
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toFiscalProfile(result.data) : null;
}

export async function createBankAccount(
  database: SupabaseClient<Database>,
  values: SatBankAccountFormValues,
) {
  const result = await database
    .from("sat_bank_accounts")
    .insert(toBankAccountPayload(values))
    .select("*")
    .single();
  if (result.error) throw result.error;
  return toBankAccount(result.data, new Map());
}

export async function findBankAccount(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("sat_bank_accounts").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toBankAccount(result.data, new Map()) : null;
}

export async function updateBankAccount(
  database: SupabaseClient<Database>,
  id: string,
  values: SatBankAccountFormValues,
) {
  const result = await database
    .from("sat_bank_accounts")
    .update(toBankAccountPayload(values))
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toBankAccount(result.data, new Map()) : null;
}
