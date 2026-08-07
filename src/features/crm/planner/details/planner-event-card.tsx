import { CalendarDays, Eye, MapPin, UsersRound } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/core/i18n";

import { bookingStatusOptions, bookingTypeOptions } from "../../client/constants/client-options";
import { eventPlannerRoleOptions } from "../constants/event-planner-options";
import { eventTypeOptions } from "../../lead/constants/lead-options";
import type { Translate } from "../../shared/types/form-types";
import type { PlannerEventListItem } from "../types/planner-event";

type PlannerEventCardProps = {
  event: PlannerEventListItem;
  locale: Locale;
  t: Translate;
};

const formatDate = (value: string, locale: Locale) => {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
};

export function PlannerEventCard({ event, locale, t }: PlannerEventCardProps) {
  const statusKey = bookingStatusOptions.find((option) => option.value === event.bookingStatus)?.translationKey;
  const bookingTypeKey = bookingTypeOptions.find((option) => option.value === event.bookingType)?.translationKey;
  const eventTypeKey = eventTypeOptions.find((option) => option.value === event.eventType)?.translationKey;
  const roleKey = eventPlannerRoleOptions.find((option) => option.value === event.role)?.translationKey;

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <h3 className="text-lg font-bold text-cyan-200">
            {event.clientName || t("common.notProvided")}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-300">
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden="true" size={16} />
              {formatDate(event.eventDate, locale)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden="true" size={16} />
              {event.venueName || t("common.notProvided")}
            </span>
            <span className="inline-flex items-center gap-2">
              <UsersRound aria-hidden="true" size={16} />
              {event.guestCount} {t("crm.planner.event.guests")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {eventTypeKey ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">{t(eventTypeKey)}</span> : null}
            {statusKey ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t(statusKey)}</span> : null}
            {bookingTypeKey ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">{t(bookingTypeKey)}</span> : null}
            {roleKey ? <span className="rounded bg-fuchsia-400/15 px-2 py-1 text-xs font-bold text-fuchsia-200">{t(roleKey)}</span> : null}
            <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
              {event.commissionEligible ? t("crm.planner.event.commissionEligible") : t("crm.planner.event.noCommission")}
            </span>
            {event.commissionPercentageOverride ? (
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
                {event.commissionPercentageOverride}%
              </span>
            ) : null}
          </div>
        </div>
        {event.clientId ? (
          <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/crm/clients/${event.clientId}`}>
            <Eye aria-hidden="true" size={16} />
            {t("crm.planner.event.viewClient")}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
