import type { TranslationKey } from "@/core/i18n";

import type { PayrollTaskCategory, PayrollTaskPayRule } from "../types/payroll-task";

type Option<TValue extends string> = {
  translationKey: TranslationKey;
  value: TValue;
};

export const payrollTaskCategoryOptions: Option<PayrollTaskCategory>[] = [
  { value: "driver", translationKey: "settings.payrollTask.category.driver" },
  { value: "operator", translationKey: "settings.payrollTask.category.operator" },
  { value: "warehouse", translationKey: "settings.payrollTask.category.warehouse" },
  { value: "kitchen", translationKey: "settings.payrollTask.category.kitchen" },
];

export const payrollTaskPayRuleOptions: Option<PayrollTaskPayRule>[] = [
  { value: "fixed", translationKey: "settings.payrollTask.payRule.fixed" },
  { value: "driver_direction", translationKey: "settings.payrollTask.payRule.driverDirection" },
  { value: "operator_hours", translationKey: "settings.payrollTask.payRule.operatorHours" },
  { value: "churro_dough", translationKey: "settings.payrollTask.payRule.churroDough" },
];
