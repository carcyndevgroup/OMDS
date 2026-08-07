import type { TranslationKey } from "@/core/i18n";

import type { TravelSettings } from "../types/travel-settings";

export type TravelSettingsErrors = Partial<
  Record<keyof TravelSettings, TranslationKey>
>;

export const initialTravelSettings: TravelSettings = {
  baseFeeMxnPerKm: "20",
  fuelConsumptionLPer100Km: "11.5",
  fuelPriceMxnPerLiter: "25.5",
  hqAddress: "Jardines Del Sur II, Benito Juarez, Quintana Roo, 77534, Mexico",
};

const isValidNumber = (value: string) =>
  value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;

export function validateTravelSettings(values: TravelSettings) {
  const errors: TravelSettingsErrors = {};

  if (!values.hqAddress.trim()) {
    errors.hqAddress = "settings.travel.validation.required";
  }

  if (!isValidNumber(values.baseFeeMxnPerKm)) {
    errors.baseFeeMxnPerKm = "settings.travel.validation.amount";
  }

  if (!isValidNumber(values.fuelConsumptionLPer100Km)) {
    errors.fuelConsumptionLPer100Km = "settings.travel.validation.amount";
  }

  if (!isValidNumber(values.fuelPriceMxnPerLiter)) {
    errors.fuelPriceMxnPerLiter = "settings.travel.validation.amount";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
