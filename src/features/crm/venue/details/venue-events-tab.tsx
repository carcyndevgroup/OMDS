"use client";

import { useTranslation } from "@/core/i18n";

import { useVenueEvents } from "../hooks/use-venue-events";
import { VenueEventCard } from "./venue-event-card";

type VenueEventsTabProps = { venueId: string };

export function VenueEventsTab({ venueId }: VenueEventsTabProps) {
  const { locale, t } = useTranslation();
  const events = useVenueEvents(venueId);

  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6">
      <div>
        <h2 className="text-2xl font-bold">{t("crm.venue.event.title")}</h2>
        <p className="mt-2 text-sm font-medium text-zinc-500">
          {t("crm.venue.event.subtitle")}
        </p>
      </div>

      {events.isLoading ? (
        <p className="text-sm text-zinc-500">{t("crm.venue.event.loading")}</p>
      ) : null}
      {events.hasError ? (
        <p className="text-sm text-rose-300">{t("crm.venue.event.loadError")}</p>
      ) : null}
      {!events.isLoading && events.events.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm font-medium text-zinc-500">
          {t("crm.venue.event.empty")}
        </p>
      ) : null}

      <div className="grid gap-4">
        {events.events.map((event) => (
          <VenueEventCard
            event={event}
            key={event.eventId}
            locale={locale}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
