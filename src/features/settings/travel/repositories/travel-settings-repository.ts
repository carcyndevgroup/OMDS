import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { initialTravelSettings } from "../schemas/travel-settings-schema";
import type { TravelSettings } from "../types/travel-settings";

type TravelSettingsRow =
  Database["public"]["Tables"]["app_travel_settings"]["Row"];

const asText = (value: number) => Number(value).toString();

const toSettings = (row: TravelSettingsRow): TravelSettings => ({
  baseFeeMxnPerKm: asText(row.base_fee_mxn_per_km),
  fuelConsumptionLPer100Km: asText(row.fuel_consumption_l_per_100km),
  fuelPriceMxnPerLiter: asText(row.fuel_price_mxn_per_liter),
  hqAddress: row.hq_address,
});

const toPayload = (values: TravelSettings) => ({
  base_fee_mxn_per_km: Number(values.baseFeeMxnPerKm),
  fuel_consumption_l_per_100km: Number(values.fuelConsumptionLPer100Km),
  fuel_price_mxn_per_liter: Number(values.fuelPriceMxnPerLiter),
  hq_address: values.hqAddress.trim(),
  id: true,
});

export async function getTravelSettings(database: SupabaseClient<Database>) {
  const result = await database
    .from("app_travel_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (result.error) throw result.error;
  if (result.data) return toSettings(result.data);

  return updateTravelSettings(database, initialTravelSettings);
}

export async function updateTravelSettings(
  database: SupabaseClient<Database>,
  values: TravelSettings,
) {
  const result = await database
    .from("app_travel_settings")
    .upsert(toPayload(values), { onConflict: "id" })
    .select("*")
    .single();

  if (result.error) throw result.error;
  return toSettings(result.data);
}
