import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { StaffFormValues, StaffMember } from "../types/staff";

type StaffRow = Database["public"]["Tables"]["staff_members"]["Row"];

const toStaff = (row: StaffRow): StaffMember => ({
  address: row.address,
  bankAccountNumber: row.bank_account_number,
  bankBeneficiary: row.bank_beneficiary,
  bankCardNumber: row.bank_card_number,
  bankClabe: row.bank_clabe,
  bankName: row.bank_name,
  createdAt: row.created_at,
  dateOfBirth: row.date_of_birth ?? "",
  displayName: row.display_name,
  email: row.email,
  id: row.id,
  idBackFileUrl: row.id_back_file_url,
  idExpirationDate: row.id_expiration_date ?? "",
  idFrontFileUrl: row.id_front_file_url,
  idNumber: row.id_number,
  idType: row.id_type,
  isActive: row.is_active,
  isDriver: row.is_driver,
  name: row.name,
  notes: row.notes,
  phone: row.phone,
  updatedAt: row.updated_at,
});

const toPayload = (values: StaffFormValues) => ({
  address: values.address.trim(),
  bank_account_number: values.bankAccountNumber.trim(),
  bank_beneficiary: values.bankBeneficiary.trim(),
  bank_card_number: values.bankCardNumber.trim(),
  bank_clabe: values.bankClabe.trim(),
  bank_name: values.bankName.trim(),
  date_of_birth: values.dateOfBirth || null,
  display_name: values.displayName.trim(),
  email: values.email.trim(),
  id_back_file_url: values.idBackFileUrl.trim(),
  id_expiration_date: values.idExpirationDate || null,
  id_front_file_url: values.idFrontFileUrl.trim(),
  id_number: values.idNumber.trim(),
  id_type: values.idType,
  is_active: values.isActive,
  is_driver: values.isDriver,
  name: values.name.trim(),
  notes: values.notes.trim(),
  phone: values.phone.trim(),
});

export async function createStaffMember(
  database: SupabaseClient<Database>,
  values: StaffFormValues,
) {
  const result = await database.from("staff_members").insert(toPayload(values)).select("*").single();
  if (result.error) throw result.error;
  return toStaff(result.data);
}

export async function findStaffMember(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("staff_members").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toStaff(result.data) : null;
}

export async function listStaffMembers(database: SupabaseClient<Database>) {
  const result = await database.from("staff_members").select("*").order("name");
  if (result.error) throw result.error;
  return result.data.map(toStaff);
}

export async function updateStaffMember(
  database: SupabaseClient<Database>,
  id: string,
  values: StaffFormValues,
) {
  const result = await database.from("staff_members").update(toPayload(values)).eq("id", id).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toStaff(result.data) : null;
}
