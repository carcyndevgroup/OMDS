"use client";

import { useTranslation } from "@/core/i18n";

import { ListColumnControl } from "../../shared/components/list-column-control";
import { useListColumns } from "../../shared/hooks/use-list-columns";
import { useEventFilters } from "../hooks/use-event-filters";
import { useEvents } from "../hooks/use-events";
import { EventListCard } from "./event-list-card";
import { EventListHeader, eventListColumns } from "./event-list-header";
import { EventListToolbar } from "./event-list-toolbar";

export function EventList() {
  const { locale, t } = useTranslation();
  const { events, hasError, isLoading } = useEvents();
  const filters = useEventFilters(events);
  const columns = useListColumns("omds:event-list-columns", eventListColumns);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("crm.event.list.title")}
          </h1>
        </header>

        <EventListToolbar
          clearFilters={filters.clearFilters}
          columnControl={(
            <ListColumnControl
              columns={eventListColumns}
              moveColumn={columns.moveColumn}
              order={columns.order}
              t={t}
              toggleColumn={columns.toggleColumn}
              visible={columns.visible}
            />
          )}
          dateSort={filters.dateSort}
          eventType={filters.eventType}
          search={filters.search}
          setDateSort={filters.setDateSort}
          setEventType={filters.setEventType}
          setSearch={filters.setSearch}
          t={t}
        />

        <section className="space-y-2">
          <EventListHeader
            onSort={filters.setSort}
            sortDirection={filters.sortDirection}
            sortField={filters.sortField}
            t={t}
            visibleColumns={columns.orderedVisible}
          />
          {isLoading ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              {t("crm.event.list.loading")}
            </p>
          ) : null}
          {hasError ? (
            <p className="py-12 text-center text-sm text-rose-300">
              {t("crm.event.list.loadError")}
            </p>
          ) : null}
          {!isLoading && !hasError && filters.filteredEvents.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
              {t("crm.event.list.empty")}
            </p>
          ) : null}
          {filters.filteredEvents.map((event) => (
            <EventListCard
              event={event}
              key={event.eventId}
              locale={locale}
              t={t}
              visibleColumns={columns.orderedVisible}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
