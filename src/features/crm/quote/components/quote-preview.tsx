"use client";

import { useEffect, useState } from "react";

import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteSummary, QuoteVersion } from "../types/quote";
import { formatQuoteMoney } from "../utils/quote-money";
import { QuoteTotals } from "./quote-totals";

type PaymentPlanSummary = {
  finalDueDaysBeforeEvent: string;
  finalDueRule: "days_before_event" | "none";
  finalPaymentPercent: string;
  name: string;
  retainerPercent: string;
};

type QuotePreviewProps = {
  quote: QuoteSummary;
  t: Translate;
  version: QuoteVersion | null;
};

export function QuotePreview({ quote, t, version }: QuotePreviewProps) {
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanSummary | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    if (!version?.paymentPlanId) {
      setPaymentPlan(null);
      return () => controller.abort();
    }

    void fetch(`/api/settings/payment-plans/${version.paymentPlanId}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("payment_plan_load_failed");
        return response.json() as Promise<{ data: PaymentPlanSummary }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setPaymentPlan(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setPaymentPlan(null);
      });

    return () => controller.abort();
  }, [version?.paymentPlanId]);

  return (
    <aside className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
          {t("crm.quote.preview.title")}
        </p>
        <span className="rounded bg-cyan-300/10 px-2 py-1 text-xs font-black text-cyan-200">
          {version ? `${t("crm.quote.version")} ${version.versionNumber}` : t("crm.quote.noVersion")}
        </span>
      </div>
      <PaymentPlanSummaryRow paymentPlan={paymentPlan} t={t} />
      <div className="min-h-[34rem] rounded-md bg-white p-6 text-zinc-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-zinc-950">
              {t("brand.shortName")}
            </div>
            <p className="text-lg font-black">{t("crm.quote.preview.footer")}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{t("crm.quote.preview.documentTitle")}</p>
            <p className="mt-2 text-sm font-bold text-zinc-500">{quote.title}</p>
          </div>
        </div>
        <div className="py-6">
          <h4 className="mb-3 text-sm font-black text-cyan-700">{t("crm.quote.preview.items")}</h4>
          {version?.items.length ? (
            <div className="overflow-hidden rounded border border-zinc-200">
              <div className="grid grid-cols-[1fr_5rem_7rem] bg-zinc-100 px-3 py-2 text-xs font-black uppercase text-zinc-500">
                <span>{t("crm.quote.field.description")}</span>
                <span className="text-right">{t("crm.quote.field.quantity")}</span>
                <span className="text-right">{t("crm.quote.preview.amount")}</span>
              </div>
              {version.items.map((item) => (
                <div className="grid grid-cols-[1fr_5rem_7rem] gap-3 border-t border-zinc-100 px-3 py-3 text-sm" key={item.id}>
                  <div>
                    <p className="font-bold">{item.description}</p>
                    {item.details ? <p className="mt-1 text-xs text-zinc-500">{item.details}</p> : null}
                  </div>
                  <p className="text-right font-bold">{item.quantity}</p>
                  <p className="text-right font-bold">{formatQuoteMoney(item.lineTotalMxn, version)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
              {t("crm.quote.preview.empty")}
            </p>
          )}
        </div>
        {version ? <QuoteTotals align="stretch" t={t} version={version} /> : null}
      </div>
    </aside>
  );
}

function PaymentPlanSummaryRow(props: { paymentPlan: PaymentPlanSummary | null; t: Translate }) {
  if (!props.paymentPlan) {
    return <p className="mb-3 rounded-md border border-dashed border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-500">{props.t("crm.quote.settings.payment.none")}</p>;
  }

  const dueText =
    props.paymentPlan.finalDueRule === "days_before_event"
      ? `${props.paymentPlan.finalDueDaysBeforeEvent} ${props.t("settings.paymentPlan.field.finalDueDaysBeforeEvent")}`
      : props.t("settings.paymentPlan.finalDue.none");

  return (
    <div className="mb-3 rounded-md border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 text-xs font-bold text-cyan-100">
      {props.paymentPlan.name}: {props.paymentPlan.retainerPercent}% {props.t("settings.paymentPlan.field.retainerPercent").toLowerCase()} / {props.paymentPlan.finalPaymentPercent}% {props.t("settings.paymentPlan.field.finalPaymentPercent").toLowerCase()} · {dueText}
    </div>
  );
}
