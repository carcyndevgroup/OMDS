import type { TranslationKey } from "@/core/i18n";

import type { EventCommissionFormValues } from "../types/event-commission";

export type EventCommissionErrors = Partial<Record<keyof EventCommissionFormValues, TranslationKey>>;

export const initialEventCommissionValues: EventCommissionFormValues = {
  amountMxn: "0",
  baseAmountMxn: "0",
  calculationModel: "fixed_percentage",
  commissionType: "planner",
  notes: "",
  payeeName: "",
  percentage: "10",
  relatedPlannerId: "",
  relatedVenueId: "",
  status: "estimated",
};

const validMoney = (value: string) => value !== "" && Number(value) >= 0;

export function validateEventCommission(values: EventCommissionFormValues) {
  const errors: EventCommissionErrors = {};
  if (!values.payeeName.trim()) errors.payeeName = "crm.quote.validation.required";
  if (!validMoney(values.baseAmountMxn)) errors.baseAmountMxn = "crm.quote.validation.money";
  if (!validMoney(values.amountMxn)) errors.amountMxn = "crm.quote.validation.money";
  if (values.calculationModel === "fixed_percentage") {
    if (!values.percentage || Number(values.percentage) < 0) {
      errors.percentage = "crm.quote.validation.money";
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
