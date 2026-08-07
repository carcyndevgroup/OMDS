"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { ListColumnControl } from "../../shared/components/list-column-control";
import { SortableListHeader } from "../../shared/components/sortable-list-header";
import { useListColumns } from "../../shared/hooks/use-list-columns";
import { useVenueList } from "../hooks/use-venue-list";
import { useVenueSearch } from "../hooks/use-venue-search";
import type { VenueSortField } from "../hooks/use-venue-search";
import { VenueListCard } from "./venue-list-card";
import { venueListColumns, venueListGridStyle, visibleVenueColumns } from "./venue-list-columns";
import { VenueListToolbar } from "./venue-list-toolbar";

export function VenueList() {
  const { t } = useTranslation();
  const state = useVenueList();
  const search = useVenueSearch(state.venues);
  const columns = useListColumns("omds:venue-list-columns", venueListColumns);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("crm.venue.list.title")}
          </h1>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950 hover:bg-cyan-200"
            href="/crm/venues/new"
          >
            <Plus aria-hidden="true" size={18} />
            {t("crm.venue.action.add")}
          </Link>
        </header>

        <VenueListToolbar
          clearFilters={search.clearFilters}
          columnControl={(
            <ListColumnControl
              columns={venueListColumns}
              moveColumn={columns.moveColumn}
              order={columns.order}
              t={t}
              toggleColumn={columns.toggleColumn}
              visible={columns.visible}
            />
          )}
          counts={search.counts}
          relationshipFilter={search.relationshipFilter}
          search={search.search}
          setRelationshipFilter={search.setRelationshipFilter}
          setSearch={search.setSearch}
          setStatusFilter={search.setStatusFilter}
          statusFilter={search.statusFilter}
          t={t}
        />

        <section className="space-y-2">
          <SortableListHeader<VenueSortField>
            columns={visibleVenueColumns(columns.orderedVisible)}
            gridClassName="lg:grid-cols-[var(--list-columns)]"
            onSort={search.setSort}
            sortDirection={search.sortDirection}
            sortField={search.sortField}
            style={venueListGridStyle(columns.orderedVisible)}
            t={t}
          />
          {state.isLoading ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              {t("crm.venue.list.loading")}
            </p>
          ) : null}
          {state.hasError ? (
            <p className="py-12 text-center text-sm text-rose-300">
              {t("crm.venue.list.loadError")}
            </p>
          ) : null}
          {!state.isLoading && !state.hasError && !search.filteredVenues.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
              {t("crm.venue.list.empty")}
            </p>
          ) : null}
          {search.filteredVenues.map((venue) => (
            <VenueListCard key={venue.id} t={t} venue={venue} visibleColumns={columns.orderedVisible} />
          ))}
        </section>
      </div>
    </main>
  );
}
