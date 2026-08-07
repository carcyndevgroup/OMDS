import { ArrowUpRight, CalendarDays, Clock, MapPin, Tag, UsersRound } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { Locale } from "@/core/i18n";

import { bookingStatusOptions } from "../../client/constants/client-options";
import { eventTypeOptions } from "../../lead/constants/lead-options";
import { serviceOptions } from "../../shared/constants/service-options";
import type { Translate } from "../../shared/types/form-types";
import type { EventListItem } from "../types/event";
import type { EventColumnId } from "./event-list-header";

type EventListCardProps = {
  event: EventListItem;
  locale: Locale;
  t: Translate;
  visibleColumns: readonly EventColumnId[];
};

const formatDate = (value: string, locale: Locale) => {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
};

const formatTime = (value: string | null) => {
  return value ? value.slice(0, 5) : "";
};

export function EventListCard({
  event,
  locale,
  t,
  visibleColumns,
}: EventListCardProps) {
  const statusKey = bookingStatusOptions.find(
    (option) => option.value === event.bookingStatus,
  )?.translationKey;
  const typeKey = eventTypeOptions.find(
    (option) => option.value === event.eventType,
  )?.translationKey;
  const services = serviceOptions.filter((service) => {
    return event.serviceIds.includes(service.id);
  });
  const cells: Record<EventColumnId, ReactNode> = {
    client: (
      <div className="pointer-events-none relative z-10 min-w-0">
        <h2 className="truncate text-base font-bold text-cyan-200">
          {event.clientName || t("common.notProvided")}
        </h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
          {typeKey ? t(typeKey) : t("common.notProvided")}
        </p>
      </div>
    ),
    date: (
      <div className="pointer-events-none relative z-10 space-y-1 text-sm font-semibold text-zinc-300">
        <span className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" size={15} />
          {formatDate(event.eventDate, locale)}
        </span>
        <span className="flex items-center gap-2 text-zinc-500">
          <Clock aria-hidden="true" size={15} />
          {formatTime(event.serviceStartTime) || t("common.notProvided")}
        </span>
      </div>
    ),
    services: (
      <div className="relative z-20 flex items-center justify-start lg:justify-center">
        <div className="group relative">
          <button
            aria-label={t("crm.event.detail.section.services")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 transition hover:border-cyan-200 focus:border-cyan-200 focus:outline-none"
            type="button"
          >
            <Tag aria-hidden="true" size={17} />
          </button>
          <div className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-72 rounded-md border border-zinc-700 bg-zinc-950 p-3 shadow-xl shadow-black/40 group-focus-within:block group-hover:block lg:left-auto lg:right-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
              {t("crm.event.detail.section.services")}
            </p>
            <div className="space-y-1">
              {services.length ? (
                services.map((service) => (
                  <p className="text-sm font-semibold text-cyan-100" key={service.id}>
                    {t(service.translationKey)}
                  </p>
                ))
              ) : (
                <p className="text-sm font-semibold text-zinc-400">
                  {t("common.notProvided")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    status: (
      <div className="pointer-events-none relative z-10 flex items-center justify-between gap-3 lg:justify-end">
        {statusKey ? (
          <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">
            {t(statusKey)}
          </span>
        ) : null}
        <ArrowUpRight aria-hidden="true" className="text-zinc-500" size={20} />
      </div>
    ),
    venue: (
      <div className="pointer-events-none relative z-10 min-w-0 space-y-1 text-sm font-semibold text-zinc-300">
        <span className="flex items-center gap-2">
          <MapPin aria-hidden="true" size={15} />
          <span className="truncate">{event.venueName || t("common.notProvided")}</span>
        </span>
        <span className="flex items-center gap-2 text-zinc-500">
          <UsersRound aria-hidden="true" size={15} />
          {event.guestCount} {t("crm.event.list.guests")}
        </span>
      </div>
    ),
  };

  return (
    <article
      className="relative grid gap-3 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 shadow-lg shadow-black/10 transition hover:border-cyan-300/60 hover:bg-zinc-900/80 lg:grid-cols-[var(--list-columns)]"
      style={gridStyle(visibleColumns)}
    >
      <Link
        aria-label={`${t("crm.event.list.action.view")} ${event.clientName}`}
        className="absolute inset-0 z-0 rounded-md"
        href={`/crm/events/${event.eventId}`}
      />

      {visibleColumns.map((column) => <div key={column}>{cells[column]}</div>)}
    </article>
  );
}

const gridStyle = (columns: readonly EventColumnId[]) => ({
  "--list-columns": columns.map((column) => {
    if (column === "client") return "1.2fr";
    if (column === "services" || column === "status") return "auto";
    return "1fr";
  }).join(" "),
} as CSSProperties);
