"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { usePaymentPlanList } from "../hooks/use-payment-plan-list";
import { PaymentPlanListCard } from "./payment-plan-list-card";

export function PaymentPlanList() {
  const { t } = useTranslation();
  const state = usePaymentPlanList();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/settings">
              <ArrowLeft aria-hidden="true" size={18} />
              {t("settings.paymentPlan.action.back")}
            </Link>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("settings.paymentPlan.title")}</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">{t("settings.paymentPlan.subtitle")}</p>
          </div>
          <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" href="/settings/payment-plans/new">
            <Plus aria-hidden="true" size={18} />
            {t("settings.paymentPlan.action.add")}
          </Link>
        </header>
        <section className="space-y-3">
          {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("settings.paymentPlan.loading")}</p> : null}
          {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("settings.paymentPlan.loadError")}</p> : null}
          {!state.isLoading && !state.hasError && !state.paymentPlans.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{t("settings.paymentPlan.empty")}</p>
          ) : null}
          {state.paymentPlans.map((paymentPlan) => (
            <PaymentPlanListCard key={paymentPlan.id} paymentPlan={paymentPlan} t={t} />
          ))}
        </section>
      </div>
    </main>
  );
}
