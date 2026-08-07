"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { ListColumnControl } from "../../shared/components/list-column-control";
import { SortableListHeader } from "../../shared/components/sortable-list-header";
import { useListColumns } from "../../shared/hooks/use-list-columns";
import { useClientFilters } from "../hooks/use-client-filters";
import type { ClientSortField } from "../hooks/use-client-filters";
import { useClients } from "../hooks/use-clients";
import { ClientListCard } from "./client-list-card";
import { clientListColumns, clientListGridStyle, visibleClientColumns } from "./client-list-columns";
import { ClientListToolbar } from "./client-list-toolbar";

export function ClientList() {
  const { locale, t } = useTranslation();
  const { archiveClient, clients, hasError, isLoading, unarchiveClient } = useClients();
  const filters = useClientFilters(clients);
  const columns = useListColumns("omds:client-list-columns", clientListColumns);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("crm.client.list.title")}
          </h1>
          <Link
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
            href="/crm/clients/new"
          >
            <Plus aria-hidden="true" size={18} />
            {t("crm.client.list.action.add")}
          </Link>
        </header>

        <ClientListToolbar
          activeView={filters.activeView}
          clearFilters={filters.clearFilters}
          columnControl={(
            <ListColumnControl
              columns={clientListColumns}
              moveColumn={columns.moveColumn}
              order={columns.order}
              t={t}
              toggleColumn={columns.toggleColumn}
              visible={columns.visible}
            />
          )}
          counts={filters.counts}
          dateSort={filters.dateSort}
          search={filters.search}
          setActiveView={filters.setActiveView}
          setDateSort={filters.setDateSort}
          setSearch={filters.setSearch}
          t={t}
        />

        <section className="space-y-2">
          <SortableListHeader<ClientSortField>
            columns={visibleClientColumns(columns.orderedVisible)}
            gridClassName="lg:grid-cols-[var(--list-columns)]"
            onSort={filters.setSort}
            sortDirection={filters.sortDirection}
            sortField={filters.sortField}
            style={clientListGridStyle(columns.orderedVisible)}
            t={t}
          />
          {isLoading ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              {t("crm.client.list.loading")}
            </p>
          ) : null}
          {hasError ? (
            <p className="py-12 text-center text-sm text-rose-300">
              {t("crm.client.list.loadError")}
            </p>
          ) : null}
          {!isLoading && !hasError && filters.filteredClients.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
              {t("crm.client.list.empty")}
            </p>
          ) : null}
          {filters.filteredClients.map((client) => (
            <ClientListCard
              client={client}
              key={client.id}
              locale={locale}
              onArchive={archiveClient}
              onUnarchive={unarchiveClient}
              t={t}
              visibleColumns={columns.orderedVisible}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
