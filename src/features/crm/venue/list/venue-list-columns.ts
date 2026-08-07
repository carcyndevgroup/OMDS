import type { CSSProperties } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { VenueSortField } from "../hooks/use-venue-search";

export type VenueColumnId = "venue" | "relationship" | "actions";

export type VenueListColumn = {
  field?: VenueSortField;
  id: VenueColumnId;
  labelKey: TranslationKey;
  required?: boolean;
};

export const venueListColumns = [
  { field: "venue", id: "venue", labelKey: "crm.venue.list.header.venue", required: true },
  { field: "relationship", id: "relationship", labelKey: "crm.venue.list.header.relationship" },
  { id: "actions", labelKey: "crm.venue.list.header.status", required: true },
] satisfies readonly VenueListColumn[];

const gridTrack = (column: VenueColumnId) => {
  if (column === "venue") return "1.2fr";
  if (column === "actions") return "auto";
  return "1fr";
};

export const venueListGridStyle = (columns: readonly VenueColumnId[]) => ({
  "--list-columns": columns.map(gridTrack).join(" "),
} as CSSProperties);

export const visibleVenueColumns = (columns: readonly VenueColumnId[]) => {
  return columns.reduce<VenueListColumn[]>((items, id) => {
    const column = venueListColumns.find((item) => item.id === id);
    return column ? [...items, column] : items;
  }, []);
};
