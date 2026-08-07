import { CalendarPlus } from "lucide-react";

import type { TranslationKey } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

type PayrollBatchActionBarProps = {
  isDisabled: boolean;
  onCreate: () => void;
  onDateChange: (value: string) => void;
  scheduledPayDate: string;
  selectedCount: number;
  selectedTotalMxn: string;
  t: (key: TranslationKey) => string;
};

export function PayrollBatchActionBar({
  isDisabled,
  onCreate,
  onDateChange,
  scheduledPayDate,
  selectedCount,
  selectedTotalMxn,
  t,
}: PayrollBatchActionBarProps) {
  return (
    <section className="sticky top-4 z-10 rounded-md border border-cyan-300/40 bg-zinc-950/95 p-4 shadow-xl shadow-black/30">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-600">
            {t("payroll.batch.selected")}
          </p>
          <p className="mt-1 text-xl font-black text-cyan-200">
            {selectedCount} · {formatMoneyMxn(selectedTotalMxn)}
          </p>
        </div>
        <label className="grid gap-2 text-sm font-bold text-zinc-300">
          {t("payroll.field.scheduledPayDate")}
          <input
            className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-cyan-300"
            onChange={(event) => onDateChange(event.target.value)}
            type="date"
            value={scheduledPayDate}
          />
        </label>
        <button
          className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isDisabled}
          onClick={onCreate}
          type="button"
        >
          <CalendarPlus aria-hidden="true" size={18} />
          {t("payroll.batch.create")}
        </button>
      </div>
    </section>
  );
}
