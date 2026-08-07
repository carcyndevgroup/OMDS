import type { EventCommissionFormValues } from "../types/event-commission";
import { initialEventCommissionValues } from "./event-commission-schema";

const read = (source: unknown, key: keyof EventCommissionFormValues) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseEventCommissionValues(source: unknown): EventCommissionFormValues {
  return {
    amountMxn: read(source, "amountMxn") || initialEventCommissionValues.amountMxn,
    baseAmountMxn: read(source, "baseAmountMxn") || initialEventCommissionValues.baseAmountMxn,
    calculationModel: (read(source, "calculationModel") || initialEventCommissionValues.calculationModel) as EventCommissionFormValues["calculationModel"],
    commissionType: (read(source, "commissionType") || initialEventCommissionValues.commissionType) as EventCommissionFormValues["commissionType"],
    notes: read(source, "notes"),
    payeeName: read(source, "payeeName"),
    percentage: read(source, "percentage") || initialEventCommissionValues.percentage,
    relatedPlannerId: read(source, "relatedPlannerId"),
    relatedVenueId: read(source, "relatedVenueId"),
    status: (read(source, "status") || initialEventCommissionValues.status) as EventCommissionFormValues["status"],
  };
}
