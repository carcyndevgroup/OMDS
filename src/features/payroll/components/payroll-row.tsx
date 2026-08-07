import { CalendarDays, ExternalLink, MapPin, ReceiptText, UserRound } from "lucide-react";
import Link from "next/link";

import type { Locale, TranslationKey } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import type { PayrollQueueItem } from "../types/payroll";

type PayrollRowProps = {
  isSelectable?: boolean;
  isSelected?: boolean;
  item: PayrollQueueItem;
  locale: Locale;
  onToggle?: (id: string) => void;
  t: (key: TranslationKey) => string;
};

const statusKeys = {
  approved: "crm.payroll.status.approved",
  estimated: "crm.payroll.status.estimated",
  paid: "crm.payroll.status.paid",
  scheduled: "crm.payroll.status.scheduled",
  waived: "crm.payroll.status.waived",
} satisfies Record<PayrollQueueItem["status"], TranslationKey>;

function formatDate(value: string, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function PayrollRow({
  isSelectable = false,
  isSelected = false,
  item,
  locale,
  onToggle,
  t,
}: PayrollRowProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="grid gap-5 lg:grid-cols-[auto_1.1fr_1.2fr_0.9fr_auto] lg:items-center">
        <input
          aria-label={t("payroll.batch.selectItem")}
          checked={isSelected}
          className="h-5 w-5 rounded border-zinc-700 bg-zinc-950 accent-cyan-300 disabled:opacity-30"
          disabled={!isSelectable}
          onChange={() => onToggle?.(item.id)}
          type="checkbox"
        />
        <div>
          <Link
            aria-label={t("payroll.action.openStaff")}
            className="text-lg font-black text-cyan-200 transition hover:text-cyan-100"
            href={`/crm/staff/${item.staffMemberId}/edit`}
          >
            {item.staffName || t("common.notProvided")}
          </Link>
          <p className="mt-1 text-sm font-bold uppercase text-zinc-500">
            {item.taskName || t("common.notProvided")}
          </p>
        </div>
        <div className="space-y-2 text-sm font-bold text-zinc-300">
          <p className="flex items-center gap-2">
            <UserRound aria-hidden="true" className="text-zinc-500" size={16} />
            {item.clientName || t("common.notProvided")}
          </p>
          <p className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="text-zinc-500" size={16} />
            {item.venueName || t("common.notProvided")}
          </p>
        </div>
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-bold text-zinc-300">
            <CalendarDays aria-hidden="true" className="text-zinc-500" size={16} />
            {formatDate(item.eventDate, locale) || t("common.notProvided")}
          </p>
          <span className="inline-flex rounded bg-cyan-300/15 px-2 py-1 text-xs font-black text-cyan-200">
            {t(statusKeys[item.status])}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <p className="text-lg font-black text-white">{formatMoneyMxn(item.amountMxn)}</p>
          <Link
            aria-label={t("payroll.action.openPayrollEvent")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-zinc-700 text-zinc-300 hover:border-cyan-300/50 hover:text-cyan-200"
            href={`/payroll/events/${item.eventId}`}
          >
            <ReceiptText aria-hidden="true" size={18} />
          </Link>
          <Link
            aria-label={t("payroll.action.openEvent")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-cyan-300/50 text-cyan-200"
            href={`/crm/events/${item.eventId}`}
          >
            <ExternalLink aria-hidden="true" size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
