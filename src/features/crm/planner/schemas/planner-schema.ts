import type { TranslationKey } from "@/core/i18n";

import type { PlannerFormValues } from "../types/planner";

export type PlannerFormErrors = Partial<
  Record<keyof PlannerFormValues, TranslationKey>
>;

export const initialPlannerFormValues: PlannerFormValues = {
  area: "",
  city: "",
  companyName: "",
  defaultCommissionModel: "fixed_percentage",
  defaultCommissionPercentage: "",
  email: "",
  instagram: "",
  internalStatus: "active",
  name: "",
  notes: "",
  phone: "",
  preferredContactMethod: "email",
  pvCommissionPolicy: "reduced_commission",
  websiteUrl: "",
  whatsapp: "",
};

export function validatePlannerForm(values: PlannerFormValues) {
  const errors: PlannerFormErrors = {};
  if (!values.name.trim()) errors.name = "crm.planner.validation.required";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
