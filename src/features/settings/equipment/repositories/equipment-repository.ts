import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EquipmentCategory,
  EquipmentFormValues,
  EquipmentItem,
} from "../types/equipment";

type EquipmentRow = Database["public"]["Tables"]["equipment_catalog"]["Row"];

const toEquipment = (row: EquipmentRow): EquipmentItem => ({
  category: row.category as EquipmentCategory,
  createdAt: row.created_at,
  id: row.id,
  isActive: row.is_active,
  name: row.name,
  notes: row.notes,
  updatedAt: row.updated_at,
});

const toPayload = (values: EquipmentFormValues) => ({
  category: values.category,
  is_active: values.isActive,
  name: values.name.trim(),
  notes: values.notes.trim(),
});

export async function createEquipment(
  database: SupabaseClient<Database>,
  values: EquipmentFormValues,
) {
  const result = await database.from("equipment_catalog").insert(toPayload(values)).select("*").single();
  if (result.error) throw result.error;
  return toEquipment(result.data);
}

export async function findEquipment(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("equipment_catalog").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toEquipment(result.data) : null;
}

export async function listEquipment(database: SupabaseClient<Database>) {
  const result = await database.from("equipment_catalog").select("*").order("category").order("name");
  if (result.error) throw result.error;
  return result.data.map(toEquipment);
}

export async function updateEquipment(
  database: SupabaseClient<Database>,
  id: string,
  values: EquipmentFormValues,
) {
  const result = await database.from("equipment_catalog").update(toPayload(values)).eq("id", id).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toEquipment(result.data) : null;
}
