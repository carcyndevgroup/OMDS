import type { TranslationKey } from "@/core/i18n";

import type { FinalDueRule, RetainerDueRule } from "../types/payment-plan";

type Option<TValue extends string> = {
  translationKey: TranslationKey;
  value: TValue;
};

export const retainerDueRuleOptions: Option<RetainerDueRule>[] = [
  {
    translationKey: "settings.paymentPlan.retainerDue.contractSignature",
    value: "contract_signature_invoice_generation",
  },
];

export const finalDueRuleOptions: Option<FinalDueRule>[] = [
  {
    translationKey: "settings.paymentPlan.finalDue.daysBeforeEvent",
    value: "days_before_event",
  },
  {
    translationKey: "settings.paymentPlan.finalDue.none",
    value: "none",
  },
];
