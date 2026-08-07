"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { PaymentPlanForm } from "../components/payment-plan-form";
import { PaymentPlanPageHeader } from "../components/payment-plan-page-header";
import { usePaymentPlan } from "../hooks/use-payment-plan";
import { usePaymentPlanMutation } from "../hooks/use-payment-plan-mutation";
import type { PaymentPlan, PaymentPlanFormValues } from "../types/payment-plan";

type PaymentPlanEditProps = { id: string };

const toFormValues = (paymentPlan: PaymentPlan): PaymentPlanFormValues => ({
  allowAdjustedFinalBalance: paymentPlan.allowAdjustedFinalBalance,
  finalDueDaysBeforeEvent: paymentPlan.finalDueDaysBeforeEvent,
  finalDueRule: paymentPlan.finalDueRule,
  finalPaymentPercent: paymentPlan.finalPaymentPercent,
  isActive: paymentPlan.isActive,
  isDefault: paymentPlan.isDefault,
  name: paymentPlan.name,
  refundNotes: paymentPlan.refundNotes,
  retainerDueRule: paymentPlan.retainerDueRule,
  retainerGracePeriodDays: paymentPlan.retainerGracePeriodDays,
  retainerPercent: paymentPlan.retainerPercent,
});

export function PaymentPlanEdit({ id }: PaymentPlanEditProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const state = usePaymentPlan(id);
  const mutation = usePaymentPlanMutation(id);

  if (state.isLoading) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("settings.paymentPlan.loading")}</main>;
  }

  if (state.hasError || !state.paymentPlan) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("settings.paymentPlan.loadError")}</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <PaymentPlanPageHeader backLabel={t("settings.paymentPlan.action.back")} title={t("settings.paymentPlan.edit.title")} />
        <PaymentPlanForm
          cancelHref="/settings/payment-plans"
          errorKey="settings.paymentPlan.edit.error"
          initialValues={toFormValues(state.paymentPlan)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/payment-plans")}
          status={mutation.status}
          submitKey="settings.paymentPlan.action.save"
          successKey="settings.paymentPlan.edit.success"
        />
      </div>
    </main>
  );
}
