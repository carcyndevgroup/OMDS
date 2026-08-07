import type { CSSProperties } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { LeadSortField } from "../hooks/use-lead-filters";

export type LeadColumnId = "lead" | "date" | "event" | "actions";

export type LeadListColumn = {
  field?: LeadSortField;
  id: LeadColumnId;
  labelKey: TranslationKey;
  required?: boolean;
};

export const leadListColumns = [
  { field: "name", id: "lead", labelKey: "crm.lead.list.header.lead", required: true },
  { field: "date", id: "date", labelKey: "crm.lead.list.header.date" },
  { field: "type", id: "event", labelKey: "crm.lead.list.header.event" },
  { id: "actions", labelKey: "crm.lead.list.header.status", required: true },
] satisfies readonly LeadListColumn[];

const gridTrack = (column: LeadColumnId) => {
  if (column === "lead") return "1.15fr";
  if (column === "event") return "0.8fr";
  if (column === "actions") return "auto";
  return "1fr";
};

export const leadListGridStyle = (columns: readonly LeadColumnId[]) => ({
  "--list-columns": columns.map(gridTrack).join(" "),
} as CSSProperties);

export const visibleLeadColumns = (columns: readonly LeadColumnId[]) => {
  return columns.reduce<LeadListColumn[]>((items, id) => {
    const column = leadListColumns.find((item) => item.id === id);
    return column ? [...items, column] : items;
  }, []);
};
