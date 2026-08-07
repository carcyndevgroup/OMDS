"use client";

import { ArrowLeft, ArrowUpRight, CalendarDays, CircleDollarSign, Landmark, Plus } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/core/i18n";
import { useTranslation } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import { useSatPayments } from "../hooks/use-sat-payments";
import type { SatPaymentQueueItem } from "../types/sat-factura";

export function SatPaymentsPage() {
  const { locale, t } = useTranslation();
  const state = useSatPayments();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/sat-facturas">
              <ArrowLeft aria-hidden="true" size={18} />
              {t("satFacturas.title")}
            </Link>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("satPayments.title")}</h1>
          </div>
          <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" href="/sat-facturas/payments/new">
            <Plus aria-hidden="true" size={18} />
            {t("satFacturas.action.registerPayment")}
          </Link>
        </header>

        {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("satFacturas.loading")}</p> : null}
        {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("satFacturas.loadError")}</p> : null}
        {!state.isLoading && !state.hasError && !state.payments.length ? (
          <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm font-bold text-zinc-500">{t("satPayments.empty")}</p>
        ) : null}
        <div className="space-y-3">
          {state.payments.map((payment) => (
            <PaymentRow key={payment.id} locale={locale} payment={payment} />
          ))}
        </div>
      </div>
    </main>
  );
}

function PaymentRow({ locale, payment }: { locale: Locale; payment: SatPaymentQueueItem }) {
  const { t } = useTranslation();

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-4 shadow-lg shadow-black/10">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
        <div>
          <h2 className="text-base font-bold text-cyan-200">{formatMoneyMxn(payment.amountMxn)}</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
            {payment.reference || t("common.notProvided")}
          </p>
        </div>
        <div className="space-y-1 text-sm font-semibold text-zinc-300">
          <IconLine icon={CalendarDays} text={formatDate(payment.paymentDate, locale)} />
          <IconLine icon={Landmark} muted text={payment.bankAccountName || t("common.notProvided")} />
        </div>
        <div className="space-y-1 text-sm font-semibold text-zinc-300">
          <IconLine icon={CircleDollarSign} text={`${payment.allocationCount} ${t("satPayments.allocationCount")}`} />
          <p className="truncate text-zinc-500">{payment.venueName || t("common.notProvided")}</p>
        </div>
        <Link
          aria-label={t("satPayments.action.view")}
          className="justify-self-start rounded-md border border-cyan-300/30 p-2 text-cyan-200 transition hover:border-cyan-200 lg:justify-self-end"
          href={`/sat-facturas/payments/${payment.id}`}
        >
          <ArrowUpRight aria-hidden="true" size={18} />
        </Link>
      </div>
    </article>
  );
}

function IconLine(props: { icon: typeof CalendarDays; muted?: boolean; text: string }) {
  const Icon = props.icon;
  return (
    <span className={`flex min-w-0 items-center gap-2 ${props.muted ? "text-zinc-500" : ""}`}>
      <Icon aria-hidden="true" className="shrink-0" size={15} />
      <span className="truncate">{props.text}</span>
    </span>
  );
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}
