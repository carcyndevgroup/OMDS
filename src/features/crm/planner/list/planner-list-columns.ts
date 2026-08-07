import type { CSSProperties } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { PlannerSortField } from "../hooks/use-planner-search";

export type PlannerColumnId = "planner" | "contact" | "actions";

export type PlannerListColumn = {
  field?: PlannerSortField;
  id: PlannerColumnId;
  labelKey: TranslationKey;
  required?: boolean;
};

export const plannerListColumns = [
  { field: "planner", id: "planner", labelKey: "crm.planner.list.header.planner", required: true },
  { field: "contact", id: "contact", labelKey: "crm.planner.list.header.contact" },
  { id: "actions", labelKey: "crm.planner.list.header.status", required: true },
] satisfies readonly PlannerListColumn[];

const gridTrack = (column: PlannerColumnId) => {
  if (column === "planner") return "1.1fr";
  if (column === "actions") return "auto";
  return "1fr";
};

export const plannerListGridStyle = (columns: readonly PlannerColumnId[]) => ({
  "--list-columns": columns.map(gridTrack).join(" "),
} as CSSProperties);

export const visiblePlannerColumns = (columns: readonly PlannerColumnId[]) => {
  return columns.reduce<PlannerListColumn[]>((items, id) => {
    const column = plannerListColumns.find((item) => item.id === id);
    return column ? [...items, column] : items;
  }, []);
};
