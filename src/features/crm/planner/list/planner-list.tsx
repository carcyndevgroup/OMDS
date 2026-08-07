"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { ListColumnControl } from "../../shared/components/list-column-control";
import { SortableListHeader } from "../../shared/components/sortable-list-header";
import { useListColumns } from "../../shared/hooks/use-list-columns";
import { usePlannerList } from "../hooks/use-planner-list";
import { usePlannerSearch } from "../hooks/use-planner-search";
import type { PlannerSortField } from "../hooks/use-planner-search";
import { PlannerListCard } from "./planner-list-card";
import { plannerListColumns, plannerListGridStyle, visiblePlannerColumns } from "./planner-list-columns";
import { PlannerListToolbar } from "./planner-list-toolbar";

export function PlannerList() {
  const { t } = useTranslation();
  const state = usePlannerList();
  const search = usePlannerSearch(state.planners);
  const columns = useListColumns("omds:planner-list-columns", plannerListColumns);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("crm.planner.list.title")}</h1>
          <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" href="/crm/planners/new">
            <Plus aria-hidden="true" size={18} />
            {t("crm.planner.action.add")}
          </Link>
        </header>
        <PlannerListToolbar
          clearFilters={search.clearFilters}
          columnControl={(
            <ListColumnControl
              columns={plannerListColumns}
              moveColumn={columns.moveColumn}
              order={columns.order}
              t={t}
              toggleColumn={columns.toggleColumn}
              visible={columns.visible}
            />
          )}
          commissionFilter={search.commissionFilter}
          counts={search.counts}
          search={search.search}
          setCommissionFilter={search.setCommissionFilter}
          setSearch={search.setSearch}
          setStatusFilter={search.setStatusFilter}
          statusFilter={search.statusFilter}
          t={t}
        />
        <section className="space-y-2">
          <SortableListHeader<PlannerSortField>
            columns={visiblePlannerColumns(columns.orderedVisible)}
            gridClassName="lg:grid-cols-[var(--list-columns)]"
            onSort={search.setSort}
            sortDirection={search.sortDirection}
            sortField={search.sortField}
            style={plannerListGridStyle(columns.orderedVisible)}
            t={t}
          />
          {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("crm.planner.list.loading")}</p> : null}
          {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("crm.planner.list.loadError")}</p> : null}
          {!state.isLoading && !state.hasError && !search.filteredPlanners.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{t("crm.planner.list.empty")}</p>
          ) : null}
          {search.filteredPlanners.map((planner) => (
            <PlannerListCard key={planner.id} planner={planner} t={t} visibleColumns={columns.orderedVisible} />
          ))}
        </section>
      </div>
    </main>
  );
}
