import type { Locale, TranslationKey } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import type { PayrollPayDateGroup } from "../types/payroll";
import { PayrollRow } from "./payroll-row";

type PayrollPayDateGroupProps = {
  group: PayrollPayDateGroup;
  locale: Locale;
  onToggle: (id: string) => void;
  selectedIds: Set<string>;
  t: (key: TranslationKey) => string;
};

function formatDate(value: string, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

const selectableStatuses = new Set(["approved", "scheduled"]);

export function PayrollPayDateGroup({
  group,
  locale,
  onToggle,
  selectedIds,
  t,
}: PayrollPayDateGroupProps) {
  const title = formatDate(group.scheduledPayDate, locale) || t("payroll.noScheduledDate");

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900/50">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-600">
            {t("payroll.field.scheduledPayDate")}
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
        </div>
        <p className="text-2xl font-black text-cyan-200">{formatMoneyMxn(group.totalMxn)}</p>
      </header>
      <div className="space-y-4 p-4">
        {group.staffGroups.map((staffGroup) => (
          <div className="space-y-3" key={staffGroup.staffMemberId}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="font-black text-zinc-200">{staffGroup.staffName || t("common.notProvided")}</p>
              <p className="text-sm font-bold text-zinc-500">
                {t("payroll.staffTotal")}: {formatMoneyMxn(staffGroup.totalMxn)}
              </p>
            </div>
            {staffGroup.items.map((item) => (
              <PayrollRow
                isSelectable={selectableStatuses.has(item.status)}
                isSelected={selectedIds.has(item.id)}
                item={item}
                key={item.id}
                locale={locale}
                onToggle={onToggle}
                t={t}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
