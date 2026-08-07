"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import type { DashboardMonthEvent } from "../types/dashboard";
import { formatDashboardTime } from "./dashboard-format";
import { getCalendarStatusClasses } from "./calendar-status-style";
import { formatMonthDay } from "./month-calendar-utils";

type CalendarEventListProps = {
  emptyKey: Parameters<ReturnType<typeof useTranslation>["t"]>[0];
  events: DashboardMonthEvent[];
  locale: string;
  showDate: boolean;
  t: ReturnType<typeof useTranslation>["t"];
};

export function CalendarEventList(props: CalendarEventListProps) {
  const { emptyKey, events, locale, showDate, t } = props;

  if (!events.length) {
    return <p className="mt-6 text-sm text-zinc-500">{t(emptyKey)}</p>;
  }

  return (
    <div className="mt-6 divide-y divide-zinc-800 border-t border-zinc-800">
      {events.map((event) => (
        <CalendarEventRow event={event} key={event.eventId} locale={locale} showDate={showDate} t={t} />
      ))}
    </div>
  );
}

function CalendarEventRow(props: {
  event: DashboardMonthEvent;
  locale: string;
  showDate: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { event, locale, showDate, t } = props;
  const style = getCalendarStatusClasses(event.bookingStatus);

  return (
    <Link
      className="flex items-center justify-between gap-4 py-4"
      href={`/crm/events/${event.eventId}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-bold ${style.title}`}>{event.clientName || event.venueName}</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${style.badge}`}>
            {t(getStatusLabelKey(event.bookingStatus))}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-zinc-500">
          {showDate ? `${formatMonthDay(event.eventDate, locale)} - ` : ""}
          {formatDashboardTime(event.serviceStartTime, locale)} - {event.venueName}
        </p>
        {event.acceptedProductNames.length ? (
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-zinc-300">
            {t("dashboard.calendar.acceptedProducts")}: {event.acceptedProductNames.join(", ")}
          </p>
        ) : null}
      </div>
      <ExternalLink aria-hidden="true" className="shrink-0 text-cyan-200" size={18} />
    </Link>
  );
}

function getStatusLabelKey(status: string) {
  return status === "confirmed"
    ? "dashboard.calendar.status.confirmed"
    : "dashboard.calendar.status.unconfirmed";
}
