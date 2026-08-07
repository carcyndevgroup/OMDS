"use client";

import { ArrowUpRight, CalendarDays, CircleDollarSign, FileText, MapPin } from "lucide-react";
import Link from "next/link";

import type { Locale, TranslationKey } from "@/core/i18n";

import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";
import type { Translate } from "@/features/crm/shared/types/form-types";

import type { SatFacturaQueueItem } from "../types/sat-factura";

type SatFacturaCardProps = {
  factura: SatFacturaQueueItem;
  locale: Locale;
  t: Translate;
};

const statusKeys: Record<SatFacturaQueueItem["status"], TranslationKey> = {
  accountant_requested: "satFacturas.status.accountant_requested",
  cancelled: "satFacturas.status.cancelled",
  issued: "satFacturas.status.issued",
  paid: "satFacturas.status.paid",
  partially_paid: "satFacturas.status.partially_paid",
  pending: "satFacturas.status.pending",
  sent_to_venue: "satFacturas.status.sent_to_venue",
};

const recipientKeys: Record<SatFacturaQueueItem["recipientType"], TranslationKey> = {
  client: "satFacturas.recipient.client",
  other: "satFacturas.recipient.other",
  venue_hotel: "satFacturas.recipient.venue_hotel",
};

export function SatFacturaCard({ factura, locale, t }: SatFacturaCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-4 shadow-lg shadow-black/10">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-bold text-cyan-200">
              {factura.clientName || t("common.notProvided")}
            </h2>
            <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">
              {t(statusKeys[factura.status])}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
            {t(recipientKeys[factura.recipientType])}
          </p>
        </div>

        <div className="space-y-1 text-sm font-semibold text-zinc-300">
          <IconLine icon={CalendarDays} text={formatDate(factura.eventDate, locale)} />
          <IconLine icon={MapPin} text={factura.venueName || t("common.notProvided")} muted />
        </div>

        <div className="space-y-1 text-sm font-semibold text-zinc-300">
          <IconLine icon={FileText} text={factura.facturaNumber || t("common.notProvided")} />
          <IconLine icon={CircleDollarSign} text={formatMoneyMxn(factura.totalMxn)} muted />
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="text-right text-xs font-bold uppercase tracking-wide text-zinc-500">
            <p>{t("satFacturas.field.dueDate")}</p>
            <p className="mt-1 text-sm text-zinc-300">
              {factura.dueAt ? formatDate(factura.dueAt, locale) : t("common.notProvided")}
            </p>
          </div>
          <Link
            aria-label={`${t("satFacturas.title")} ${factura.clientName}`}
            className="rounded-md border border-cyan-300/30 p-2 text-cyan-200 transition hover:border-cyan-200"
            href={`/sat-facturas/${factura.id}`}
          >
            <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>
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
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}
