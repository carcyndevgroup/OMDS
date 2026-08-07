"use client";

import { CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import type { UpcomingDashboardEvent } from "../types/dashboard";
import { formatDashboardDate, formatDashboardTime } from "./dashboard-format";

type PanelProps = {
  hasError: boolean;
  isLoading: boolean;
  items: UpcomingDashboardEvent[];
  locale: string;
  t: ReturnType<typeof useTranslation>["t"];
};

export function UpcomingEventsPanel(props: PanelProps) {
  const { t } = props;

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 border-b border-zinc-800 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
          <CalendarDays aria-hidden="true" size={21} />
        </span>
        <h2 className="text-xl font-bold">
          {t("dashboard.section.upcomingEvents")}
        </h2>
      </div>
      <UpcomingEventsContent {...props} />
    </section>
  );
}

function UpcomingEventsContent(props: PanelProps) {
  const { hasError, isLoading, items, locale, t } = props;

  if (isLoading) {
    return <p className="p-6 text-sm text-zinc-500">{t("dashboard.loading.upcomingEvents")}</p>;
  }

  if (hasError) {
    return <p className="p-6 text-sm text-rose-300">{t("dashboard.error.upcomingEvents")}</p>;
  }

  if (!items.length) {
    return <p className="p-6 text-sm text-zinc-500">{t("dashboard.empty.upcomingEvents")}</p>;
  }

  return (
    <div className="divide-y divide-zinc-800">
      {items.map((item) => (
        <UpcomingEventRow item={item} key={item.eventId} locale={locale} t={t} />
      ))}
    </div>
  );
}

function UpcomingEventRow(props: {
  item: UpcomingDashboardEvent;
  locale: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { item, locale, t } = props;

  return (
    <article className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <p className="font-bold text-cyan-200">{item.clientName || item.venueName}</p>
        <dl className="mt-3 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
          <Detail label={t("dashboard.field.eventDate")} value={formatDashboardDate(item.eventDate, locale)} />
          <Detail label={t("dashboard.field.serviceTime")} value={formatDashboardTime(item.serviceStartTime, locale)} />
          <Detail label={t("dashboard.field.venue")} value={item.venueName} />
          <Detail label={t("dashboard.field.guests")} value={String(item.guestCount)} />
        </dl>
        {item.acceptedProductNames.length ? (
          <p className="mt-4 line-clamp-2 text-sm font-semibold text-zinc-300">
            {t("dashboard.calendar.acceptedProducts")}: {item.acceptedProductNames.join(", ")}
          </p>
        ) : null}
      </div>
      <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/40 px-4 text-sm font-bold text-cyan-200 transition hover:border-cyan-200" href={`/crm/events/${item.eventId}`}>
        <ExternalLink aria-hidden="true" size={16} />
        {t("dashboard.viewEvent")}
      </Link>
    </article>
  );
}

function Detail(props: { label: string; value: string }) {
  const { t } = useTranslation();

  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-widest text-zinc-600">{props.label}</dt>
      <dd className="mt-1 truncate text-zinc-300">{props.value || t("common.notProvided")}</dd>
    </div>
  );
}
