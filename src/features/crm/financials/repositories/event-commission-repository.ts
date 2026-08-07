import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EventCommission,
  EventCommissionModel,
  EventCommissionStatus,
  EventCommissionType,
  EventCommissionFormValues,
} from "../types/event-commission";

type CommissionRow =
  Database["public"]["Tables"]["event_commissions"]["Row"];

const toMoney = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const calculateAmount = (values: EventCommissionFormValues) => {
  if (values.calculationModel !== "fixed_percentage") {
    return toMoney(values.amountMxn);
  }

  return toMoney(values.baseAmountMxn) * (toMoney(values.percentage) / 100);
};

const relationPayload = (values: EventCommissionFormValues) => ({
  related_planner_id:
    values.commissionType === "planner" && values.relatedPlannerId
      ? values.relatedPlannerId
      : null,
  related_venue_id:
    values.commissionType === "venue_hotel" && values.relatedVenueId
      ? values.relatedVenueId
      : null,
});

const commissionPayload = (
  eventId: string,
  values: EventCommissionFormValues,
) => ({
  ...relationPayload(values),
  amount_mxn: calculateAmount(values),
  base_amount_mxn: toMoney(values.baseAmountMxn),
  calculation_model: values.calculationModel,
  commission_type: values.commissionType,
  event_id: eventId,
  notes: values.notes.trim(),
  payee_name: values.payeeName.trim(),
  percentage:
    values.calculationModel === "fixed_percentage"
      ? toMoney(values.percentage)
      : null,
  status: values.status,
});

export const mapEventCommission = (row: CommissionRow): EventCommission => ({
  amountMxn: String(row.amount_mxn),
  baseAmountMxn: String(row.base_amount_mxn),
  calculationModel: row.calculation_model as EventCommissionModel,
  commissionType: row.commission_type as EventCommissionType,
  id: row.id,
  notes: row.notes,
  payeeName: row.payee_name,
  percentage: row.percentage === null ? "" : String(row.percentage),
  relatedPlannerId: row.related_planner_id,
  relatedVenueId: row.related_venue_id,
  status: row.status as EventCommissionStatus,
});

export async function listEventCommissions(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const result = await database
    .from("event_commissions")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (result.error) throw result.error;
  return result.data.map(mapEventCommission);
}

export async function createEventCommission(
  database: SupabaseClient<Database>,
  eventId: string,
  values: EventCommissionFormValues,
) {
  const result = await database
    .from("event_commissions")
    .insert(commissionPayload(eventId, values))
    .select("id")
    .single();

  if (result.error) throw result.error;
  return result.data.id;
}

export async function updateEventCommission(
  database: SupabaseClient<Database>,
  eventId: string,
  commissionId: string,
  values: EventCommissionFormValues,
) {
  const result = await database
    .from("event_commissions")
    .update(commissionPayload(eventId, values))
    .eq("event_id", eventId)
    .eq("id", commissionId)
    .select("id")
    .single();

  if (result.error) throw result.error;
  return result.data.id;
}

export async function deleteEventCommission(
  database: SupabaseClient<Database>,
  eventId: string,
  commissionId: string,
) {
  const result = await database
    .from("event_commissions")
    .delete()
    .eq("event_id", eventId)
    .eq("id", commissionId);

  if (result.error) throw result.error;
}
