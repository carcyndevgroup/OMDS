import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { Planner, PlannerFormValues } from "../types/planner";
import type { PlannerRepository } from "./planner-repository";

type PlannerRow = Database["public"]["Tables"]["planners"]["Row"];

const toNumberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toPlanner = (row: PlannerRow): Planner => ({
  area: row.area,
  city: row.city,
  companyName: row.company_name,
  createdAt: row.created_at,
  defaultCommissionModel: row.default_commission_model,
  defaultCommissionPercentage: row.default_commission_percentage,
  email: row.email,
  id: row.id,
  instagram: row.instagram,
  internalStatus: row.internal_status === "inactive" ? "inactive" : "active",
  name: row.name,
  notes: row.notes,
  phone: row.phone,
  preferredContactMethod: row.preferred_contact_method,
  pvCommissionPolicy: row.pv_commission_policy,
  updatedAt: row.updated_at,
  websiteUrl: row.website_url,
  whatsapp: row.whatsapp,
});

const toPayload = (values: PlannerFormValues) => ({
  area: values.area,
  city: values.city.trim(),
  company_name: values.companyName.trim(),
  default_commission_model: values.defaultCommissionModel,
  default_commission_percentage: toNumberOrNull(values.defaultCommissionPercentage),
  email: values.email.trim(),
  instagram: values.instagram.trim(),
  internal_status: values.internalStatus,
  name: values.name.trim(),
  notes: values.notes.trim(),
  phone: values.phone.trim(),
  preferred_contact_method: values.preferredContactMethod,
  pv_commission_policy: values.pvCommissionPolicy,
  website_url: values.websiteUrl.trim(),
  whatsapp: values.whatsapp.trim(),
});

export function createSupabasePlannerRepository(
  client: SupabaseClient<Database>,
): PlannerRepository {
  return {
    async create(values) {
      const result = await client.from("planners").insert(toPayload(values)).select("*").single();
      if (result.error) throw result.error;
      return toPlanner(result.data);
    },
    async findById(id) {
      const result = await client.from("planners").select("*").eq("id", id).maybeSingle();
      if (result.error) throw result.error;
      return result.data ? toPlanner(result.data) : null;
    },
    async list() {
      const result = await client.from("planners").select("*").order("name");
      if (result.error) throw result.error;
      return result.data.map(toPlanner);
    },
    async update(id, values) {
      const result = await client
        .from("planners")
        .update(toPayload(values))
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (result.error) throw result.error;
      return result.data ? toPlanner(result.data) : null;
    },
  };
}
