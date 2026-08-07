import { Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { Translate } from "../../shared/types/form-types";
import type { ClientDateSort, ClientListView } from "../hooks/use-client-filters";

type ClientListToolbarProps = {
  activeView: ClientListView;
  clearFilters: () => void;
  columnControl: ReactNode;
  counts: Record<ClientListView, number>;
  dateSort: ClientDateSort;
  search: string;
  setActiveView: (value: ClientListView) => void;
  setDateSort: (value: ClientDateSort) => void;
  setSearch: (value: string) => void;
  t: Translate;
};

const viewOptions: ClientListView[] = ["active", "confirmed", "archived"];

export function ClientListToolbar(props: ClientListToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-2">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem_auto_auto]">
        <label className="relative block">
          <span className="sr-only">{props.t("crm.client.list.searchPlaceholder")}</span>
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            size={20}
          />
          <input
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 pl-11 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 hover:border-zinc-700 focus:border-cyan-300"
            onChange={(event) => props.setSearch(event.target.value)}
            placeholder={props.t("crm.client.list.searchPlaceholder")}
            type="search"
            value={props.search}
          />
        </label>

        <label className="block">
          <span className="sr-only">{props.t("crm.client.list.statusView")}</span>
          <select
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm font-semibold text-white outline-none transition hover:border-zinc-700 focus:border-cyan-300"
            onChange={(event) => props.setActiveView(event.target.value as ClientListView)}
            value={props.activeView}
          >
            {viewOptions.map((view) => (
              <option key={view} value={view}>
                {props.t(`crm.client.list.view.${view}`)} ({props.counts[view]})
              </option>
            ))}
          </select>
        </label>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 text-sm font-bold text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200"
          onClick={() => setShowFilters((current) => !current)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={18} />
          {props.t("crm.client.list.action.filters")}
        </button>
        {props.columnControl}
      </div>

      {showFilters ? (
        <div className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-900/70 p-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">
              {props.t("crm.client.list.filter.sortDate")}
            </span>
            <select
              className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition hover:border-zinc-700 focus:border-cyan-300"
              onChange={(event) => props.setDateSort(event.target.value as ClientDateSort)}
              value={props.dateSort}
            >
              <option value="earliest">{props.t("crm.client.list.sort.earliest")}</option>
              <option value="latest">{props.t("crm.client.list.sort.latest")}</option>
            </select>
          </label>

          <button
            className="h-11 self-end rounded-md border border-zinc-800 px-4 text-sm font-bold text-zinc-300 transition hover:border-rose-300 hover:text-rose-200"
            onClick={props.clearFilters}
            type="button"
          >
            {props.t("crm.client.list.action.clearFilters")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
