import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { CSSProperties } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../types/form-types";

export type SortDirection = "asc" | "desc";

export type SortableListColumn<TField extends string> = {
  field?: TField;
  labelKey: TranslationKey;
};

type SortableListHeaderProps<TField extends string> = {
  columns: readonly SortableListColumn<TField>[];
  gridClassName: string;
  onSort: (field: TField) => void;
  sortDirection: SortDirection;
  sortField: TField;
  style?: CSSProperties;
  t: Translate;
};

function SortIcon(props: { direction: SortDirection; isActive: boolean }) {
  if (!props.isActive) return <ArrowUpDown aria-hidden="true" size={13} />;
  return props.direction === "asc" ? (
    <ArrowUp aria-hidden="true" size={13} />
  ) : (
    <ArrowDown aria-hidden="true" size={13} />
  );
}

export function SortableListHeader<TField extends string>(
  props: SortableListHeaderProps<TField>,
) {
  return (
    <div
      className={`hidden rounded-md border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-500 lg:grid lg:items-center lg:gap-4 ${props.gridClassName}`}
      style={props.style}
    >
      {props.columns.map((column) => {
        if (!column.field) {
          return <span key={column.labelKey}>{props.t(column.labelKey)}</span>;
        }

        const isActive = props.sortField === column.field;
        return (
          <button
            className="inline-flex items-center gap-2 text-left transition hover:text-cyan-200"
            key={column.field}
            onClick={() => props.onSort(column.field as TField)}
            type="button"
          >
            {props.t(column.labelKey)}
            <SortIcon direction={props.sortDirection} isActive={isActive} />
          </button>
        );
      })}
    </div>
  );
}
