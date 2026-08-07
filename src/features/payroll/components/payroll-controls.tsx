import { Download, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { PayrollFilters, PayrollQueueItem } from "../types/payroll";

type PayrollControlsProps = {
  filters: PayrollFilters;
  items: PayrollQueueItem[];
  onChange: (filters: PayrollFilters) => void;
  onClear: () => void;
  onExport: () => void;
  t: (key: TranslationKey) => string;
};

const statusKeys: Record<PayrollQueueItem["status"], TranslationKey> = {
  approved: "crm.payroll.status.approved",
  estimated: "crm.payroll.status.estimated",
  paid: "crm.payroll.status.paid",
  scheduled: "crm.payroll.status.scheduled",
  waived: "crm.payroll.status.waived",
};

const paymentMethodKeys = {
  cash: "payroll.payment.method.cash",
  spei: "payroll.payment.method.spei",
} satisfies Record<"cash" | "spei", TranslationKey>;

function uniqueOptions(
  items: PayrollQueueItem[],
  idKey: keyof PayrollQueueItem,
  labelKey: keyof PayrollQueueItem,
) {
  const options = new Map<string, string>();
  items.forEach((item) => {
    const id = String(item[idKey] ?? "");
    if (id) options.set(id, String(item[labelKey] ?? ""));
  });
  return Array.from(options.entries()).sort((a, b) => a[1].localeCompare(b[1]));
}

export function PayrollControls({
  filters,
  items,
  onChange,
  onClear,
  onExport,
  t,
}: PayrollControlsProps) {
  const staffOptions = uniqueOptions(items, "staffMemberId", "staffName");
  const eventOptions = uniqueOptions(items, "eventId", "clientName");
  const statuses = Array.from(new Set(items.map((item) => item.status)));

  const setFilter = (field: keyof PayrollFilters, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <section className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 p-4 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto_auto]">
      <Select label={t("payroll.field.staff")} onChange={(value) => setFilter("staff", value)} value={filters.staff}>
        {staffOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </Select>
      <Select label={t("payroll.field.event")} onChange={(value) => setFilter("event", value)} value={filters.event}>
        {eventOptions.map(([id, label]) => <option key={id} value={id}>{label || id}</option>)}
      </Select>
      <Select label={t("payroll.field.status")} onChange={(value) => setFilter("status", value)} value={filters.status}>
        {statuses.map((status) => <option key={status} value={status}>{t(statusKeys[status])}</option>)}
      </Select>
      <label className="grid gap-2 text-xs font-black uppercase tracking-widest text-zinc-600">
        {t("payroll.field.scheduledPayDate")}
        <input
          className="h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm font-bold normal-case tracking-normal text-white outline-none focus:border-cyan-300"
          onChange={(event) => setFilter("payDate", event.target.value)}
          type="date"
          value={filters.payDate}
        />
      </label>
      <Select
        label={t("payroll.payment.field.method")}
        onChange={(value) => setFilter("paymentMethod", value)}
        value={filters.paymentMethod}
      >
        {Object.entries(paymentMethodKeys).map(([method, key]) => (
          <option key={method} value={method}>{t(key)}</option>
        ))}
      </Select>
      <button className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-md border border-zinc-800 px-4 text-sm font-black text-zinc-300 hover:border-cyan-300/50 hover:text-cyan-200" onClick={onClear} type="button">
        <RotateCcw aria-hidden="true" size={17} />
        {t("payroll.filters.clear")}
      </button>
      <button className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950" onClick={onExport} type="button">
        <Download aria-hidden="true" size={17} />
        {t("payroll.export.csv")}
      </button>
    </section>
  );
}

function Select(props: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-widest text-zinc-600">
      {props.label}
      <select
        className="h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm font-bold normal-case tracking-normal text-white outline-none focus:border-cyan-300"
        onChange={(event) => props.onChange(event.target.value)}
        value={props.value}
      >
        <option value="">-</option>
        {props.children}
      </select>
    </label>
  );
}
