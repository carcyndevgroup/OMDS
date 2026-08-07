import type { TravelSettings } from "../types/travel-settings";
import { initialTravelSettings } from "./travel-settings-schema";

const readString = (source: unknown, key: keyof TravelSettings) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseTravelSettings(source: unknown): TravelSettings {
  return {
    baseFeeMxnPerKm:
      readString(source, "baseFeeMxnPerKm") ||
      initialTravelSettings.baseFeeMxnPerKm,
    fuelConsumptionLPer100Km:
      readString(source, "fuelConsumptionLPer100Km") ||
      initialTravelSettings.fuelConsumptionLPer100Km,
    fuelPriceMxnPerLiter:
      readString(source, "fuelPriceMxnPerLiter") ||
      initialTravelSettings.fuelPriceMxnPerLiter,
    hqAddress:
      readString(source, "hqAddress") || initialTravelSettings.hqAddress,
  };
}
