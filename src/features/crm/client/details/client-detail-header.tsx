import {
  ArrowLeft,
  CalendarDays,
  HandCoins,
  MapPin,
  Pencil,
  Tags,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { bookingStatusOptions, bookingTypeOptions } from "../constants/client-options";
import { serviceOptions } from "../../shared/constants/service-options";
import type { ClientDetailSectionProps } from "./client-detail-types";
import { formatClientDate } from "./client-detail-types";

export function ClientDetailHeader({
  client,
  locale,
  t,
}: ClientDetailSectionProps) {
  const pathname = usePathname();
  const event = client.event;
  const statusKey = bookingStatusOptions.find(
    (option) => option.value === event?.bookingStatus,
  )?.translationKey;
  const bookingTypeKey = bookingTypeOptions.find(
    (option) => option.value === event?.bookingType,
  )?.translationKey;
  const services = serviceOptions.filter((service) => {
    return event?.serviceIds.includes(service.id);
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            aria-label={t("crm.client.detail.action.back")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            href="/crm/clients"
          >
            <ArrowLeft aria-hidden="true" size={21} />
          </Link>
          <h1 className="truncate text-3xl font-bold sm:text-4xl">
            {client.firstName} {client.lastName}
          </h1>
          {statusKey ? (
            <span className="shrink-0 rounded bg-cyan-300/15 px-2.5 py-1 text-xs font-bold text-cyan-200">
              {t(statusKey)}
            </span>
          ) : null}
        </div>
        {!pathname.endsWith("/edit") ? (
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
            href={`/crm/clients/${client.id}/edit`}
          >
            <Pencil aria-hidden="true" size={17} />
            {t("crm.client.detail.action.edit")}
          </Link>
        ) : null}
      </header>

      {event ? (
        <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.06] px-5 py-4 text-sm font-semibold text-zinc-300">
          <span className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="text-cyan-200" size={17} />
            {formatClientDate(event.eventDate, locale)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="text-cyan-200" size={17} />
            {event.venueName || t("common.notProvided")}
          </span>
          <span className="flex items-center gap-2">
            <UsersRound aria-hidden="true" className="text-cyan-200" size={17} />
            {event.guestCount} {t("crm.lead.list.guests")}
          </span>
          {bookingTypeKey ? (
            <span className="flex items-center gap-2">
              <HandCoins aria-hidden="true" className="text-cyan-200" size={17} />
              {t(bookingTypeKey)}
            </span>
          ) : null}
          <span className="flex min-w-0 items-start gap-2">
            <Tags
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-cyan-200"
              size={17}
            />
            <span>
              {services.length
                ? services.map((service) => t(service.translationKey)).join(", ")
                : t("crm.client.detail.empty.services")}
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
