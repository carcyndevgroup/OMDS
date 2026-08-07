import type { TranslationKey } from "@/core/i18n";

import type { EventPlannerFormValues } from "../types/event-planner";

export type EventPlannerFormErrors = Partial<
  Record<keyof EventPlannerFormValues, TranslationKey>
>;

export const initialEventPlannerFormValues: EventPlannerFormValues = {
  commissionEligible: true,
  commissionPercentageOverride: "",
  isPrimary: true,
  notes: "",
  plannerId: "",
  role: "primary_planner",
};

export function validateEventPlannerForm(values: EventPlannerFormValues) {
  const errors: EventPlannerFormErrors = {};
  if (!values.plannerId) errors.plannerId = "crm.planner.validation.required";
  if (!values.role) errors.role = "crm.planner.validation.required";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
