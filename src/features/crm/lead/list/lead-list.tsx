"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { ListColumnControl } from "../../shared/components/list-column-control";
import { SortableListHeader } from "../../shared/components/sortable-list-header";
import { useListColumns } from "../../shared/hooks/use-list-columns";
import { useLeadFilters } from "../hooks/use-lead-filters";
import type { LeadSortField } from "../hooks/use-lead-filters";
import { useLeads } from "../hooks/use-leads";
import { LeadListCard } from "./lead-list-card";
import { leadListColumns, leadListGridStyle, visibleLeadColumns } from "./lead-list-columns";
import { LeadListToolbar } from "./lead-list-toolbar";

export function LeadList() {
  const { locale, t } = useTranslation();
  const { archiveLead, deleteLead, hasError, isLoading, leads, unarchiveLead } = useLeads();
  const filters = useLeadFilters(leads);
  const columns = useListColumns("omds:lead-list-columns", leadListColumns);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("crm.lead.list.title")}
          </h1>
          <Link
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
            href="/crm/leads/new"
          >
            <Plus aria-hidden="true" size={18} />
            {t("crm.lead.list.action.add")}
          </Link>
        </header>

        <LeadListToolbar
          activeTab={filters.activeTab}
          clearFilters={filters.clearFilters}
          columnControl={(
            <ListColumnControl
              columns={leadListColumns}
              moveColumn={columns.moveColumn}
              order={columns.order}
              t={t}
              toggleColumn={columns.toggleColumn}
              visible={columns.visible}
            />
          )}
          counts={filters.counts}
          dateSort={filters.dateSort}
          eventType={filters.eventType}
          leadSource={filters.leadSource}
          search={filters.search}
          setActiveTab={filters.setActiveTab}
          setDateSort={filters.setDateSort}
          setEventType={filters.setEventType}
          setLeadSource={filters.setLeadSource}
          setSearch={filters.setSearch}
          t={t}
        />

        <section className="space-y-2">
          <SortableListHeader<LeadSortField>
            columns={visibleLeadColumns(columns.orderedVisible)}
            gridClassName="lg:grid-cols-[var(--list-columns)]"
            onSort={filters.setSort}
            sortDirection={filters.sortDirection}
            sortField={filters.sortField}
            style={leadListGridStyle(columns.orderedVisible)}
            t={t}
          />
          {isLoading ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              {t("crm.lead.list.loading")}
            </p>
          ) : null}
          {hasError ? (
            <p className="py-12 text-center text-sm text-rose-300">
              {t("crm.lead.list.loadError")}
            </p>
          ) : null}
          {!isLoading && !hasError && filters.filteredLeads.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
              {t("crm.lead.list.empty")}
            </p>
          ) : null}
          {filters.filteredLeads.map((lead) => (
            <LeadListCard
              key={lead.id}
              lead={lead}
              onArchive={archiveLead}
              onUnarchive={unarchiveLead}
              locale={locale}
              onDelete={deleteLead}
              t={t}
              visibleColumns={columns.orderedVisible}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
