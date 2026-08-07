"use client";

import { ArrowLeft, CalendarDays, ExternalLink, ReceiptText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale } from "@/core/i18n";
import { useTranslation } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import { usePayrollPayment } from "../hooks/use-payroll-payment";

type PayrollPaymentDetailProps = {
  paymentId: string;
};

function formatDate(value: string, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatEventDate(value: string, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

export function PayrollPaymentDetail({ paymentId }: PayrollPaymentDetailProps) {
  const { locale, t } = useTranslation();
  const state = usePayrollPayment(paymentId);

  if (state.isLoading) return <Shell>{t("payroll.loading")}</Shell>;
  if (state.hasError || !state.payment) return <Shell>{t("payroll.loadError")}</Shell>;

  const payment = state.payment;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header>
          <Link className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/payroll">
            <ArrowLeft aria-hidden="true" size={18} />
            {t("payroll.payment.detail.back")}
          </Link>
          <h1 className="text-3xl font-bold sm:text-4xl">{t("payroll.payment.detail.title")}</h1>
          <p className="mt-2 text-base font-bold text-cyan-200">{formatMoneyMxn(payment.totalMxn)}</p>
        </header>

        <DetailSection icon={<ReceiptText aria-hidden="true" size={22} />} title={t("payroll.payment.detail.summary")}>
          <Field label={t("payroll.payment.field.method")} value={payment.paymentMethod.toUpperCase()} />
          <Field label={t("payroll.payment.field.paidAt")} value={formatDate(payment.paidAt, locale)} />
          <Field label={t("payroll.payment.field.transactionId")} value={payment.transactionId} />
          <Field label={t("payroll.payment.field.bonus")} value={formatMoneyMxn(payment.bonusMxn)} />
          <Field label={t("payroll.payment.field.sendingAccount")} value={payment.sendingAccount} />
          <Field label={t("payroll.payment.field.receivingAccount")} value={payment.receivingAccount} />
          <Field label={t("payroll.payment.field.receiptFileUrl")} value={payment.receiptFileUrl} />
          <Field label={t("payroll.payment.field.notes")} value={payment.notes} />
        </DetailSection>

        <DetailSection icon={<CalendarDays aria-hidden="true" size={22} />} title={t("payroll.payment.detail.items")}>
          <div className="space-y-3 md:col-span-2">
            {payment.lineItems.map((item) => (
              <article
                className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                key={item.id}
              >
                <div>
                  <h3 className="text-lg font-black text-cyan-200">{item.staffName || t("common.notProvided")}</h3>
                  <p className="mt-1 text-sm font-bold text-zinc-300">{item.taskName || t("common.notProvided")}</p>
                  <p className="mt-2 text-sm font-bold text-zinc-500">
                    {item.clientName || t("common.notProvided")} · {formatEventDate(item.eventDate, locale)} ·{" "}
                    {item.venueName || t("common.notProvided")}
                  </p>
                </div>
                <p className="text-lg font-black text-white">{formatMoneyMxn(item.amountMxn)}</p>
                <Link
                  aria-label={t("payroll.action.openEvent")}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-cyan-300/50 text-cyan-200"
                  href={`/crm/events/${item.eventId}`}
                >
                  <ExternalLink aria-hidden="true" size={18} />
                </Link>
              </article>
            ))}
          </div>
        </DetailSection>
      </div>
    </main>
  );
}

function DetailSection(props: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/20">
      <h2 className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4 text-xl font-bold">
        <span className="text-cyan-200">{props.icon}</span>
        {props.title}
      </h2>
      <div className="grid gap-5 p-5 md:grid-cols-2">{props.children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-zinc-100">{value || t("common.notProvided")}</p>
    </div>
  );
}

function Shell(props: { children: ReactNode }) {
  return <main className="min-h-screen bg-zinc-950 p-8 text-center text-sm text-zinc-500">{props.children}</main>;
}
