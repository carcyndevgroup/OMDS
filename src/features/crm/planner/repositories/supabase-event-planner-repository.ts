import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EventPlanner,
  EventPlannerFormValues,
} from "../types/event-planner";
import type { EventPlannerRepository } from "./event-planner-repository";

type EventPlannerRow = Database["public"]["Tables"]["event_planners"]["Row"];
type PlannerRow = Database["public"]["Tables"]["planners"]["Row"];

const toNumberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toPayload = (eventId: string, values: EventPlannerFormValues) => ({
  commission_eligible: values.commissionEligible,
  commission_percentage_override: toNumberOrNull(values.commissionPercentageOverride),
  event_id: eventId,
  is_primary: values.isPrimary,
  notes: values.notes.trim(),
  planner_id: values.plannerId,
  role: values.role,
});

const toEventPlanner = (
  row: EventPlannerRow,
  planner?: PlannerRow,
): EventPlanner => ({
  commissionEligible: row.commission_eligible,
  commissionPercentageOverride: row.commission_percentage_override,
  email: planner?.email ?? "",
  eventId: row.event_id,
  id: row.id,
  isPrimary: row.is_primary,
  notes: row.notes,
  plannerCompanyName: planner?.company_name ?? "",
  plannerId: row.planner_id,
  plannerName: planner?.name ?? "",
  role: row.role,
});

async function hydratePlanners(
  client: SupabaseClient<Database>,
  rows: EventPlannerRow[],
) {
  const plannerIds = rows.map((row) => row.planner_id);
  if (!plannerIds.length) return [];

  const planners = await client.from("planners").select("*").in("id", plannerIds);
  if (planners.error) throw planners.error;

  const plannerById = new Map(planners.data.map((planner) => [planner.id, planner]));
  return rows.map((row) => toEventPlanner(row, plannerById.get(row.planner_id)));
}

export function createSupabaseEventPlannerRepository(
  client: SupabaseClient<Database>,
): EventPlannerRepository {
  return {
    async create(eventId, values) {
      const result = await client.from("event_planners").insert(toPayload(eventId, values)).select("*").single();
      if (result.error) throw result.error;
      return (await hydratePlanners(client, [result.data]))[0];
    },
    async delete(eventId, eventPlannerId) {
      const result = await client
        .from("event_planners")
        .delete()
        .eq("event_id", eventId)
        .eq("id", eventPlannerId);

      if (result.error) throw result.error;
    },
    async listByEvent(eventId) {
      const result = await client
        .from("event_planners")
        .select("*")
        .eq("event_id", eventId)
        .order("is_primary", { ascending: false });

      if (result.error) throw result.error;
      return hydratePlanners(client, result.data);
    },
    async update(eventId, eventPlannerId, values) {
      const result = await client
        .from("event_planners")
        .update(toPayload(eventId, values))
        .eq("event_id", eventId)
        .eq("id", eventPlannerId)
        .select("*")
        .maybeSingle();

      if (result.error) throw result.error;
      return result.data ? (await hydratePlanners(client, [result.data]))[0] : null;
    },
  };
}
