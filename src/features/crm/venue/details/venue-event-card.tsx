import { CalendarDays, Eye, Mail, Tag, UsersRound } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/core/i18n";

import { bookingStatusOptions, bookingTypeOptions } from "../../client/constants/client-options";
import { eventTypeOptions } from "../../lead/constants/lead-options";
import { serviceOptions } from "../../shared/constants/service-options";
import type { Translate } from "../../shared/types/form-types";
import type { VenueEventListItem } from "../types/venue-event";

type VenueEventCardProps = {
  event: VenueEventListItem;
  locale: Locale;
  t: Translate;
};

const formatDate = (value: string, locale: Locale) => {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
};

export function VenueEventCard({ event, locale, t }: VenueEventCardProps) {
  const eventTypeKey = eventTypeOptions.find(
    (option) => option.value === event.eventType,
  )?.translationKey;
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
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-cyan-200">
              {event.clientName || t("common.notProvided")}
            </h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
              <Mail aria-hidden="true" size={15} />
              {event.clientEmail || t("common.notProvided")}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-300">
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden="true" size={16} />
              {formatDate(event.eventDate, locale)}
            </span>
            <span className="inline-flex items-center gap-2">
              <UsersRound aria-hidden="true" size={16} />
              {event.guestCount} {t("crm.venue.event.guests")}
            </span>
            <span>{eventTypeKey ? t(eventTypeKey) : t("common.notProvided")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusKey ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t(statusKey)}</span> : null}
            {bookingTypeKey ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">{t(bookingTypeKey)}</span> : null}
            {event.isPaymentPartnerEvent ? <span className="rounded bg-fuchsia-400/15 px-2 py-1 text-xs font-bold text-fuchsia-200">{t("crm.venue.event.paymentPartner")}</span> : null}
          </div>
          {services.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <span className="inline-flex items-center gap-1.5 rounded bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-200" key={service.id}>
                  <Tag aria-hidden="true" size={13} />
                  {t(service.translationKey)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {event.clientId ? (
          <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/crm/clients/${event.clientId}`}>
            <Eye aria-hidden="true" size={16} />
            {t("crm.venue.event.viewClient")}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
