import { Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../../shared/types/form-types";
import type {
  VenueRelationshipFilter,
  VenueStatusFilter,
} from "../hooks/use-venue-search";

type VenueListToolbarProps = {
  clearFilters: () => void;
  columnControl: ReactNode;
  counts: Record<VenueStatusFilter, number>;
  relationshipFilter: VenueRelationshipFilter;
  search: string;
  setRelationshipFilter: (value: VenueRelationshipFilter) => void;
  setSearch: (value: string) => void;
  setStatusFilter: (value: VenueStatusFilter) => void;
  statusFilter: VenueStatusFilter;
  t: Translate;
};

const relationshipOptions: { labelKey: TranslationKey; value: VenueRelationshipFilter }[] = [
  { labelKey: "crm.venue.filter.allRelationships", value: "all" },
  { labelKey: "crm.venue.status.preferred", value: "preferred" },
  { labelKey: "crm.venue.status.nonPreferred", value: "nonPreferred" },
];

const statusOptions: { labelKey: TranslationKey; value: VenueStatusFilter }[] = [
  { labelKey: "crm.venue.status.active", value: "active" },
  { labelKey: "crm.venue.status.inactive", value: "inactive" },
];

export function VenueListToolbar(props: VenueListToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-2">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem_auto_auto]">
        <label className="relative block">
          <span className="sr-only">{props.t("crm.venue.list.searchPlaceholder")}</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 pl-11 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300"
            onChange={(event) => props.setSearch(event.target.value)}
            placeholder={props.t("crm.venue.list.searchPlaceholder")}
            type="search"
            value={props.search}
          />
        </label>

        <label className="block">
          <span className="sr-only">{props.t("crm.venue.list.statusView")}</span>
          <select
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-300"
            onChange={(event) => props.setStatusFilter(event.target.value as VenueStatusFilter)}
            value={props.statusFilter}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {props.t(option.labelKey)} ({props.counts[option.value]})
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
          {props.t("crm.venue.list.filters")}
        </button>
        {props.columnControl}
      </div>

      {showFilters ? (
        <div className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-900/70 p-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">
              {props.t("crm.venue.filter.relationship")}
            </span>
            <select
              className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-300"
              onChange={(event) => props.setRelationshipFilter(event.target.value as VenueRelationshipFilter)}
              value={props.relationshipFilter}
            >
              {relationshipOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {props.t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <button
            className="h-11 self-end rounded-md border border-zinc-800 px-4 text-sm font-bold text-zinc-300 transition hover:border-rose-300 hover:text-rose-200"
            onClick={props.clearFilters}
            type="button"
          >
            {props.t("crm.venue.list.clearFilters")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
