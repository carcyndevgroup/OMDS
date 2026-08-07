import { SlidersHorizontal, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import {
  eventTypeOptions,
  leadSourceOptions,
} from "../constants/lead-options";
import type { EventType, LeadSource } from "../types/lead";
import type { Translate } from "../components/lead-form-types";
import type { LeadDateSort, LeadListTab } from "./lead-list-types";

type LeadListToolbarProps = {
  activeTab: LeadListTab;
  clearFilters: () => void;
  columnControl: ReactNode;
  counts: Record<LeadListTab, number>;
  dateSort: LeadDateSort;
  eventType: EventType | "";
  leadSource: LeadSource | "";
  search: string;
  setActiveTab: (value: LeadListTab) => void;
  setDateSort: (value: LeadDateSort) => void;
  setEventType: (value: EventType | "") => void;
  setLeadSource: (value: LeadSource | "") => void;
  setSearch: (value: string) => void;
  t: Translate;
};

const selectClassName =
  "h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none transition hover:border-zinc-600 focus:border-cyan-300";

const statusTabs: { id: LeadListTab; labelKey: Parameters<Translate>[0] }[] = [
  { id: "active", labelKey: "crm.lead.list.tab.active" },
  { id: "converted", labelKey: "crm.lead.list.tab.converted" },
  { id: "archived", labelKey: "crm.lead.list.tab.archived" },
];

export function LeadListToolbar(props: LeadListToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { t } = props;

  return (
    <div className="space-y-2">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem_auto_auto]">
        <label className="relative block">
          <span className="sr-only">{t("crm.lead.list.searchPlaceholder")}</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={18}
          />
          <input
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 pl-11 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 hover:border-zinc-700 focus:border-cyan-300"
            onChange={(event) => props.setSearch(event.target.value)}
            placeholder={t("crm.lead.list.searchPlaceholder")}
            type="search"
            value={props.search}
          />
        </label>

        <label className="block">
          <span className="sr-only">{t("crm.lead.list.statusView")}</span>
          <select
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm font-semibold text-white outline-none transition hover:border-zinc-700 focus:border-cyan-300"
            onChange={(event) => props.setActiveTab(event.target.value as LeadListTab)}
            value={props.activeTab}
          >
            {statusTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {t(tab.labelKey)} ({props.counts[tab.id]})
              </option>
            ))}
          </select>
        </label>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 text-sm font-bold text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200"
          onClick={() => setIsFilterOpen((current) => !current)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={16} />
          {t("crm.lead.list.action.filters")}
        </button>
        {props.columnControl}
      </div>

      {isFilterOpen ? (
        <div className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="space-y-2 text-sm font-semibold text-zinc-300">
            <span>{t("crm.lead.list.filter.eventType")}</span>
            <select
              className={selectClassName}
              onChange={(event) => props.setEventType(event.target.value as EventType | "")}
              value={props.eventType}
            >
              <option value="">{t("crm.lead.list.filter.allTypes")}</option>
              {eventTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.translationKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-zinc-300">
            <span>{t("crm.lead.list.filter.leadSource")}</span>
            <select
              className={selectClassName}
              onChange={(event) => props.setLeadSource(event.target.value as LeadSource | "")}
              value={props.leadSource}
            >
              <option value="">{t("crm.lead.list.filter.allSources")}</option>
              {leadSourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.translationKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-zinc-300">
            <span>{t("crm.lead.list.filter.sortDate")}</span>
            <select
              className={selectClassName}
              onChange={(event) => props.setDateSort(event.target.value as LeadDateSort)}
              value={props.dateSort}
            >
              <option value="earliest">{t("crm.lead.list.sort.earliest")}</option>
              <option value="latest">{t("crm.lead.list.sort.latest")}</option>
            </select>
          </label>

          <button
            className="self-end rounded-md px-3 py-3 text-sm font-bold text-cyan-200 transition hover:bg-white/[0.05] hover:text-cyan-100"
            onClick={props.clearFilters}
            type="button"
          >
            {t("crm.lead.list.action.clearFilters")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
