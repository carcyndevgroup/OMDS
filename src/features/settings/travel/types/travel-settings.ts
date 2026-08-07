export type TravelSettings = {
  baseFeeMxnPerKm: string;
  fuelConsumptionLPer100Km: string;
  fuelPriceMxnPerLiter: string;
  hqAddress: string;
};

export type TravelSettingsResponse = {
  data: TravelSettings;
};
