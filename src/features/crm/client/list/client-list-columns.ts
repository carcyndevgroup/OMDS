import type { CSSProperties } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { ClientSortField } from "../hooks/use-client-filters";

export type ClientColumnId = "client" | "contact" | "event" | "actions";

export type ClientListColumn = {
  field?: ClientSortField;
  id: ClientColumnId;
  labelKey: TranslationKey;
  required?: boolean;
};

export const clientListColumns = [
  { field: "client", id: "client", labelKey: "crm.client.list.header.client", required: true },
  { field: "contact", id: "contact", labelKey: "crm.client.list.header.contact" },
  { field: "venue", id: "event", labelKey: "crm.client.list.header.event" },
  { id: "actions", labelKey: "crm.client.list.header.status", required: true },
] satisfies readonly ClientListColumn[];

const gridTrack = (column: ClientColumnId) => {
  if (column === "client") return "1.15fr";
  if (column === "actions") return "auto";
  return "1fr";
};

export const clientListGridStyle = (columns: readonly ClientColumnId[]) => ({
  "--list-columns": columns.map(gridTrack).join(" "),
} as CSSProperties);

export const visibleClientColumns = (columns: readonly ClientColumnId[]) => {
  return columns.reduce<ClientListColumn[]>((items, id) => {
    const column = clientListColumns.find((item) => item.id === id);
    return column ? [...items, column] : items;
  }, []);
};
