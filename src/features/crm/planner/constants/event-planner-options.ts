import type { TranslationKey } from "@/core/i18n";

export const eventPlannerRoleOptions = [
  { translationKey: "crm.planner.event.role.primaryPlanner", value: "primary_planner" },
  { translationKey: "crm.planner.event.role.referralPlanner", value: "referral_planner" },
  { translationKey: "crm.planner.event.role.coordinator", value: "coordinator" },
  { translationKey: "crm.planner.event.role.other", value: "other" },
] satisfies { translationKey: TranslationKey; value: string }[];
