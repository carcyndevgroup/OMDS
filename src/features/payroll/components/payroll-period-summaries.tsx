import { CalendarRange } from "lucide-react";

import type { Locale, TranslationKey } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import type { PayrollPeriodSummary } from "../types/payroll";

type PayrollPeriodSummariesProps = {
  locale: Locale;
  summaries: PayrollPeriodSummary[];
  t: (key: TranslationKey) => string;
};

function formatRange(summary: PayrollPeriodSummary, locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "short",
  });
  return `${formatter.format(new Date(`${summary.startDate}T00:00:00`))} - ${formatter.format(
    new Date(`${summary.endDate}T00:00:00`),
  )}`;
}

function titleKey(summary: PayrollPeriodSummary): TranslationKey {
  return summary.title === "currentMonth"
    ? "payroll.period.currentMonth"
    : "payroll.period.weekly";
}

export function PayrollPeriodSummaries({
  locale,
  summaries,
  t,
}: PayrollPeriodSummariesProps) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900/50">
      <header className="flex items-center gap-3 border-b border-zinc-800 p-5">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
          <CalendarRange aria-hidden="true" size={22} />
        </span>
        <div>
          <h2 className="text-2xl font-black text-white">{t("payroll.period.title")}</h2>
          <p className="text-sm font-bold text-zinc-500">{t("payroll.period.subtitle")}</p>
        </div>
      </header>
      <div className="grid gap-3 p-4 lg:grid-cols-5">
        {summaries.map((summary) => (
          <article className="rounded-md border border-zinc-800 bg-zinc-950 p-4" key={`${summary.title}-${summary.endDate}`}>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-600">
              {t(titleKey(summary))}
            </p>
            <h3 className="mt-1 text-sm font-black text-cyan-200">{formatRange(summary, locale)}</h3>
            <dl className="mt-4 space-y-2 text-sm font-bold">
              <Row label={t("payroll.period.pending")} value={formatMoneyMxn(summary.pendingMxn)} />
              <Row label={t("payroll.period.paid")} value={formatMoneyMxn(summary.paidMxn)} />
              <Row label={t("payroll.period.total")} value={formatMoneyMxn(summary.totalMxn)} />
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-white">{value}</dd>
    </div>
  );
}
