import type { TranslationKey } from "@/core/i18n";
import type { CSSProperties } from "react";

import { SortableListHeader } from "../../shared/components/sortable-list-header";
import type { Translate } from "../../shared/types/form-types";
import type {
  EventSortDirection,
  EventSortField,
} from "../hooks/use-event-filters";

type HeaderColumn = {
  field?: EventSortField;
  id: EventColumnId;
  labelKey: TranslationKey;
};

type EventListHeaderProps = {
  visibleColumns: readonly EventColumnId[];
  onSort: (field: EventSortField) => void;
  sortDirection: EventSortDirection;
  sortField: EventSortField;
  t: Translate;
};

export type EventColumnId = "client" | "date" | "venue" | "services" | "status";

export const eventListColumns = [
  { field: "client", id: "client", labelKey: "crm.event.list.header.client", required: true },
  { field: "date", id: "date", labelKey: "crm.event.list.header.date" },
  { field: "venue", id: "venue", labelKey: "crm.event.list.header.venue" },
  { id: "services", labelKey: "crm.event.list.header.services" },
  { id: "status", labelKey: "crm.event.list.header.status" },
] satisfies readonly (HeaderColumn & { required?: boolean })[];

const gridTemplate = (columns: readonly EventColumnId[]) => {
  return columns.map((column) => {
    if (column === "client") return "1.2fr";
    if (column === "services" || column === "status") return "auto";
    return "1fr";
  }).join(" ");
};

const cssVariable = (columns: readonly EventColumnId[]) => ({
  "--list-columns": gridTemplate(columns),
} as CSSProperties);

const visibleHeaderColumns = (columns: readonly EventColumnId[]) => {
  return columns.reduce<HeaderColumn[]>((items, id) => {
    const column = eventListColumns.find((item) => item.id === id);
    return column ? [...items, column] : items;
  }, []);
};

export function EventListHeader(props: EventListHeaderProps) {
  const columns = visibleHeaderColumns(props.visibleColumns);

  return (
    <SortableListHeader<EventSortField>
      columns={columns}
      gridClassName="lg:grid-cols-[var(--list-columns)]"
      onSort={props.onSort}
      sortDirection={props.sortDirection}
      sortField={props.sortField}
      style={cssVariable(props.visibleColumns)}
      t={props.t}
    />
  );
}
