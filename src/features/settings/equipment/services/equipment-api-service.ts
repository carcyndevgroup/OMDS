import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { EquipmentFormValues } from "../types/equipment";
import {
  createEquipment,
  findEquipment,
  listEquipment,
  updateEquipment,
} from "../repositories/equipment-repository";

export async function createEquipmentApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: EquipmentFormValues) => createEquipment(client, values),
    find: (id: string) => findEquipment(client, id),
    list: () => listEquipment(client),
    update: (id: string, values: EquipmentFormValues) =>
      updateEquipment(client, id, values),
  };
}
