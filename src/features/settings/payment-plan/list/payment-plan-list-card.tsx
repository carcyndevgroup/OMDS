import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Translate } from "@/features/crm/shared/types/form-types";

import type { PaymentPlan } from "../types/payment-plan";

type PaymentPlanListCardProps = {
  paymentPlan: PaymentPlan;
  t: Translate;
};

export function PaymentPlanListCard({ paymentPlan, t }: PaymentPlanListCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-cyan-200">{paymentPlan.name}</h2>
            {paymentPlan.isDefault ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t("settings.paymentPlan.status.default")}</span> : null}
            {!paymentPlan.isActive ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">{t("settings.paymentPlan.status.inactive")}</span> : null}
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            {t("settings.paymentPlan.list.retainer")}: {paymentPlan.retainerPercent}% · {t("settings.paymentPlan.list.final")}: {paymentPlan.finalPaymentPercent}%
          </p>
        </div>
        <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/settings/payment-plans/${paymentPlan.id}/edit`}>
          <Pencil aria-hidden="true" size={16} />
          {t("settings.paymentPlan.action.edit")}
        </Link>
      </div>
    </article>
  );
}
