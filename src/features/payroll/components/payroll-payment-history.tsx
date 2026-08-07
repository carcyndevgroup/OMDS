import { ExternalLink, ReceiptText } from "lucide-react";
import Link from "next/link";

import type { Locale, TranslationKey } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import type { PayrollPaymentHistoryItem } from "../types/payroll";

type PayrollPaymentHistoryProps = {
  hasError: boolean;
  isLoading: boolean;
  locale: Locale;
  payments: PayrollPaymentHistoryItem[];
  t: (key: TranslationKey) => string;
};

function formatDateTime(value: string, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PayrollPaymentHistory({
  hasError,
  isLoading,
  locale,
  payments,
  t,
}: PayrollPaymentHistoryProps) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900/50">
      <header className="flex items-center gap-3 border-b border-zinc-800 p-5">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
          <ReceiptText aria-hidden="true" size={22} />
        </span>
        <div>
          <h2 className="text-2xl font-black text-white">{t("payroll.payment.history.title")}</h2>
          <p className="text-sm font-bold text-zinc-500">{t("payroll.payment.history.subtitle")}</p>
        </div>
      </header>
      <div className="space-y-3 p-4">
        {isLoading ? <p className="py-6 text-center text-sm text-zinc-500">{t("payroll.loading")}</p> : null}
        {hasError ? <p className="py-6 text-center text-sm text-rose-300">{t("payroll.loadError")}</p> : null}
        {!isLoading && !hasError && !payments.length ? (
          <p className="py-6 text-center text-sm font-bold text-zinc-500">
            {t("payroll.payment.history.empty")}
          </p>
        ) : null}
        {payments.map((payment) => (
          <article
            className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
            key={payment.id}
          >
            <div>
              <p className="text-lg font-black text-cyan-200">
                {payment.staffNames.join(", ") || t("common.notProvided")}
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-500">
                {formatDateTime(payment.paidAt, locale)} · {payment.paymentMethod.toUpperCase()} ·{" "}
                {payment.lineItemCount} {t("payroll.payment.history.items")}
              </p>
            </div>
            <p className="text-xl font-black text-white">{formatMoneyMxn(payment.totalMxn)}</p>
            <Link
              aria-label={t("payroll.payment.history.open")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-cyan-300/50 text-cyan-200"
              href={`/payroll/payments/${payment.id}`}
            >
              <ExternalLink aria-hidden="true" size={18} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
