"use client";

import { ArrowLeft, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale } from "@/core/i18n";
import { useTranslation } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import { usePayrollEvent } from "../hooks/use-payroll-event";
import { PayrollRow } from "./payroll-row";
import { PayrollSummaryCard } from "./payroll-summary-card";

type PayrollEventDetailProps = {
  eventId: string;
};

function formatDate(value: string, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

export function PayrollEventDetail({ eventId }: PayrollEventDetailProps) {
  const { locale, t } = useTranslation();
  const state = usePayrollEvent(eventId);

  if (state.isLoading) return <Shell>{t("payroll.loading")}</Shell>;
  if (state.hasError || !state.event) return <Shell>{t("payroll.loadError")}</Shell>;

  const event = state.event;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header>
          <Link className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/payroll">
            <ArrowLeft aria-hidden="true" size={18} />
            {t("payroll.payment.detail.back")}
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                {event.clientName || t("common.notProvided")}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-4 text-sm font-bold text-zinc-500">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays aria-hidden="true" size={16} />
                  {formatDate(event.eventDate, locale) || t("common.notProvided")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin aria-hidden="true" size={16} />
                  {event.venueName || t("common.notProvided")}
                </span>
              </p>
            </div>
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-md border border-cyan-300/50 px-4 text-sm font-black text-cyan-200"
              href={`/crm/events/${event.eventId}`}
            >
              <ExternalLink aria-hidden="true" size={18} />
              {t("payroll.event.openCrm")}
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <PayrollSummaryCard icon={CalendarDays} label={t("payroll.event.total")} value={formatMoneyMxn(event.totalMxn)} />
          <PayrollSummaryCard icon={CalendarDays} label={t("payroll.event.paid")} value={formatMoneyMxn(event.paidMxn)} />
          <PayrollSummaryCard icon={CalendarDays} label={t("payroll.event.pending")} value={formatMoneyMxn(event.pendingMxn)} />
        </section>

        <section className="space-y-3">
          {event.lineItems.map((item) => (
            <PayrollRow item={item} key={item.id} locale={locale} t={t} />
          ))}
        </section>
      </div>
    </main>
  );
}

function Shell(props: { children: ReactNode }) {
  return <main className="min-h-screen bg-zinc-950 p-8 text-center text-sm text-zinc-500">{props.children}</main>;
}
