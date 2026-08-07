import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { StaffFormValues } from "../types/staff";
import {
  createStaffMember,
  findStaffMember,
  listStaffMembers,
  updateStaffMember,
} from "../repositories/staff-repository";

export async function createStaffApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: StaffFormValues) => createStaffMember(client, values),
    find: (id: string) => findStaffMember(client, id),
    list: () => listStaffMembers(client),
    update: (id: string, values: StaffFormValues) =>
      updateStaffMember(client, id, values),
  };
}
