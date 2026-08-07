"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { PaymentPlanForm } from "../components/payment-plan-form";
import { PaymentPlanPageHeader } from "../components/payment-plan-page-header";
import { usePaymentPlanMutation } from "../hooks/use-payment-plan-mutation";
import { initialPaymentPlanFormValues } from "../schemas/payment-plan-schema";

export function PaymentPlanCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = usePaymentPlanMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <PaymentPlanPageHeader backLabel={t("settings.paymentPlan.action.back")} title={t("settings.paymentPlan.new.title")} />
        <PaymentPlanForm
          cancelHref="/settings/payment-plans"
          errorKey="settings.paymentPlan.message.createError"
          initialValues={initialPaymentPlanFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/payment-plans")}
          status={mutation.status}
          submitKey="settings.paymentPlan.action.create"
          successKey="settings.paymentPlan.message.created"
        />
      </div>
    </main>
  );
}
