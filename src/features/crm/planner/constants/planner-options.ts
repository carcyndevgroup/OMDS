import type { TranslationKey } from "@/core/i18n";

import { venueAreaOptions } from "../../venue/constants/venue-options";

const option = (translationKey: TranslationKey, value: string) => ({
  translationKey,
  value,
});

export const plannerAreaOptions = venueAreaOptions;

export const plannerContactMethodOptions = [
  option("crm.planner.method.email", "email"),
  option("crm.planner.method.phone", "phone"),
  option("crm.planner.method.whatsapp", "whatsapp"),
  option("crm.planner.method.instagram", "instagram"),
  option("crm.planner.method.none", "none"),
];

export const plannerCommissionModelOptions = [
  option("crm.planner.commission.none", "none"),
  option("crm.planner.commission.fixedPercentage", "fixed_percentage"),
  option("crm.planner.commission.fixedAmount", "fixed_amount"),
  option("crm.planner.commission.caseByCase", "case_by_case"),
  option("crm.planner.commission.notesOnly", "notes_only"),
];

export const pvCommissionPolicyOptions = [
  option("crm.planner.pvPolicy.noCommission", "no_commission"),
  option("crm.planner.pvPolicy.reducedCommission", "reduced_commission"),
  option("crm.planner.pvPolicy.caseByCase", "case_by_case"),
  option("crm.planner.pvPolicy.fullCommission", "full_commission_allowed"),
];

export const plannerStatusOptions = [
  option("crm.planner.status.active", "active"),
  option("crm.planner.status.inactive", "inactive"),
];
