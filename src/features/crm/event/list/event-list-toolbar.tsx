import { Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { eventTypeOptions } from "../../lead/constants/lead-options";
import type { Translate } from "../../shared/types/form-types";
import type { EventDateSort, EventTypeFilter } from "../hooks/use-event-filters";

type EventListToolbarProps = {
  clearFilters: () => void;
  columnControl: ReactNode;
  dateSort: EventDateSort;
  eventType: EventTypeFilter;
  search: string;
  setDateSort: (value: EventDateSort) => void;
  setEventType: (value: EventTypeFilter) => void;
  setSearch: (value: string) => void;
  t: Translate;
};

export function EventListToolbar({
  clearFilters,
  columnControl,
  dateSort,
  eventType,
  search,
  setDateSort,
  setEventType,
  setSearch,
  t,
}: EventListToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-2">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative block">
          <span className="sr-only">{t("crm.event.list.searchPlaceholder")}</span>
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            size={20}
          />
          <input
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 pl-11 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("crm.event.list.searchPlaceholder")}
            type="search"
            value={search}
          />
        </label>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 text-sm font-bold text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200"
          onClick={() => setShowFilters((current) => !current)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={18} />
          {t("crm.event.list.action.filters")}
        </button>
        {columnControl}
      </div>

      {showFilters ? (
        <div className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-900/70 p-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">
              {t("crm.event.list.filter.eventType")}
            </span>
            <select
              className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-300"
              onChange={(event) => setEventType(event.target.value as EventTypeFilter)}
              value={eventType}
            >
              <option value="all">{t("crm.event.list.type.all")}</option>
              {eventTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.translationKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">
              {t("crm.event.list.filter.sortDate")}
            </span>
            <select
              className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-300"
              onChange={(event) => setDateSort(event.target.value as EventDateSort)}
              value={dateSort}
            >
              <option value="earliest">{t("crm.event.list.sort.earliest")}</option>
              <option value="latest">{t("crm.event.list.sort.latest")}</option>
            </select>
          </label>

          <button
            className="h-11 self-end rounded-md border border-zinc-800 px-4 text-sm font-bold text-zinc-300 transition hover:border-rose-300 hover:text-rose-200"
            onClick={clearFilters}
            type="button"
          >
            {t("crm.event.list.action.clearFilters")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
