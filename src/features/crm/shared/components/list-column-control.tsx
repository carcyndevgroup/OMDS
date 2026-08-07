import { ArrowDown, ArrowUp, Columns3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { ListColumnConfig } from "../hooks/use-list-columns";
import type { Translate } from "../types/form-types";

type ListColumnControlProps<TId extends string> = {
  columns: readonly (ListColumnConfig<TId> & { labelKey: TranslationKey })[];
  moveColumn: (id: TId, direction: -1 | 1) => void;
  order: TId[];
  t: Translate;
  toggleColumn: (id: TId) => void;
  visible: TId[];
};

export function ListColumnControl<TId extends string>(
  props: ListColumnControlProps<TId>,
) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const orderedColumns = props.order
    .map((id) => props.columns.find((column) => column.id === id))
    .filter((column): column is (typeof props.columns)[number] => Boolean(column));

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (containerRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 text-sm font-bold text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Columns3 aria-hidden="true" size={18} />
        {props.t("common.show")}
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-md border border-zinc-700 bg-zinc-950 p-3 shadow-xl shadow-black/40">
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
            {props.t("common.visibleColumns")}
          </p>
          <div className="mt-3 space-y-2">
            {orderedColumns.map((column, index) => (
              <div className="flex items-center gap-2" key={column.id}>
                <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-bold text-zinc-200">
                  <input
                    checked={props.visible.includes(column.id)}
                    className="h-4 w-4 accent-cyan-300"
                    disabled={column.required}
                    onChange={() => props.toggleColumn(column.id)}
                    type="checkbox"
                  />
                  <span className="truncate">{props.t(column.labelKey)}</span>
                </label>
                <button
                  aria-label={props.t("common.moveUp")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-800 text-zinc-300 disabled:opacity-30"
                  disabled={index === 0}
                  onClick={() => props.moveColumn(column.id, -1)}
                  type="button"
                >
                  <ArrowUp aria-hidden="true" size={14} />
                </button>
                <button
                  aria-label={props.t("common.moveDown")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-800 text-zinc-300 disabled:opacity-30"
                  disabled={index === orderedColumns.length - 1}
                  onClick={() => props.moveColumn(column.id, 1)}
                  type="button"
                >
                  <ArrowDown aria-hidden="true" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
