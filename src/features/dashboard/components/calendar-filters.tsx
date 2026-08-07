"use client";

import { useTranslation } from "@/core/i18n";

type CalendarFiltersProps = {
  includeUnconfirmed: boolean;
  onChange: (value: boolean) => void;
  t: ReturnType<typeof useTranslation>["t"];
};

export function CalendarFilters(props: CalendarFiltersProps) {
  return (
    <div className="border-b border-zinc-800 px-5 py-4">
      <label className="flex items-center justify-between gap-4 rounded-md border border-zinc-800 bg-zinc-950/60 px-4 py-3">
        <span>
          <span className="block text-sm font-bold text-zinc-100">
            {props.t("dashboard.calendar.filter.unconfirmed")}
          </span>
          <span className="mt-1 block text-xs font-medium text-zinc-500">
            {props.t("dashboard.calendar.filter.unconfirmedHint")}
          </span>
        </span>
        <input
          checked={props.includeUnconfirmed}
          className="h-5 w-5 accent-cyan-300"
          onChange={(event) => props.onChange(event.target.checked)}
          type="checkbox"
        />
      </label>
    </div>
  );
}
