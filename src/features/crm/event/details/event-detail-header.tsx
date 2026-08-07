import {
  ArrowLeft,
  CalendarDays,
  HandCoins,
  MapPin,
  Tags,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { bookingStatusOptions, bookingTypeOptions } from "../../client/constants/client-options";
import { serviceOptions } from "../../shared/constants/service-options";
import type { EventDetailSectionProps } from "./event-detail-types";
import { formatEventDate } from "./event-detail-types";

export function EventDetailHeader({
  event,
  locale,
  t,
}: EventDetailSectionProps) {
  const statusKey = bookingStatusOptions.find(
    (option) => option.value === event.bookingStatus,
  )?.translationKey;
  const bookingTypeKey = bookingTypeOptions.find(
    (option) => option.value === event.bookingType,
  )?.translationKey;
  const services = serviceOptions.filter((service) => {
    return event.serviceIds.includes(service.id);
  });

  return (
    <div className="space-y-5">
      <header className="flex min-w-0 items-center gap-3">
        <Link
          aria-label={t("crm.event.detail.action.back")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          href="/crm/events"
        >
          <ArrowLeft aria-hidden="true" size={21} />
        </Link>
        <h1 className="truncate text-3xl font-bold sm:text-4xl">
          {event.clientName || t("crm.event.detail.title")}
        </h1>
        {statusKey ? (
          <span className="shrink-0 rounded bg-cyan-300/15 px-2.5 py-1 text-xs font-bold text-cyan-200">
            {t(statusKey)}
          </span>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.06] px-5 py-4 text-sm font-semibold text-zinc-300">
        <span className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="text-cyan-200" size={17} />
          {formatEventDate(event.eventDate, locale)}
        </span>
        <span className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="text-cyan-200" size={17} />
          {event.venueName || t("common.notProvided")}
        </span>
        <span className="flex items-center gap-2">
          <UsersRound aria-hidden="true" className="text-cyan-200" size={17} />
          {event.guestCount} {t("crm.event.list.guests")}
        </span>
        {bookingTypeKey ? (
          <span className="flex items-center gap-2">
            <HandCoins aria-hidden="true" className="text-cyan-200" size={17} />
            {t(bookingTypeKey)}
          </span>
        ) : null}
        <span className="flex min-w-0 items-start gap-2">
          <Tags className="mt-0.5 shrink-0 text-cyan-200" size={17} />
          <span>
            {services.length
              ? services.map((service) => t(service.translationKey)).join(", ")
              : t("crm.event.detail.empty.services")}
          </span>
        </span>
      </div>
    </div>
  );
}
