import type { TranslationKey } from "@/core/i18n";

import type { PaymentPlanFormValues } from "../types/payment-plan";

export type PaymentPlanFormErrors = Partial<
  Record<keyof PaymentPlanFormValues, TranslationKey>
>;

export const initialPaymentPlanFormValues: PaymentPlanFormValues = {
  allowAdjustedFinalBalance: true,
  finalDueDaysBeforeEvent: "14",
  finalDueRule: "days_before_event",
  finalPaymentPercent: "60",
  isActive: true,
  isDefault: false,
  name: "",
  refundNotes: "",
  retainerDueRule: "contract_signature_invoice_generation",
  retainerGracePeriodDays: "3",
  retainerPercent: "40",
};

export function validatePaymentPlanForm(values: PaymentPlanFormValues) {
  const errors: PaymentPlanFormErrors = {};
  if (!values.name.trim()) {
    errors.name = "settings.paymentPlan.validation.required";
  }

  const retainerPercent = Number(values.retainerPercent);
  const finalPaymentPercent = Number(values.finalPaymentPercent);

  if (!values.retainerPercent || retainerPercent < 0 || retainerPercent > 100) {
    errors.retainerPercent = "settings.paymentPlan.validation.percent";
  }
  if (!values.finalPaymentPercent || finalPaymentPercent < 0 || finalPaymentPercent > 100) {
    errors.finalPaymentPercent = "settings.paymentPlan.validation.percent";
  }
  if (retainerPercent + finalPaymentPercent !== 100) {
    errors.finalPaymentPercent = "settings.paymentPlan.validation.percentTotal";
  }
  if (
    !values.retainerGracePeriodDays ||
    Number(values.retainerGracePeriodDays) < 0
  ) {
    errors.retainerGracePeriodDays = "settings.paymentPlan.validation.days";
  }
  if (
    values.finalDueRule === "days_before_event" &&
    (!values.finalDueDaysBeforeEvent || Number(values.finalDueDaysBeforeEvent) < 0)
  ) {
    errors.finalDueDaysBeforeEvent = "settings.paymentPlan.validation.days";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
