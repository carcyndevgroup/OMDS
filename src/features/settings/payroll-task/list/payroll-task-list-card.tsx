import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Translate } from "@/features/crm/shared/types/form-types";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import type { PayrollTask } from "../types/payroll-task";

type PayrollTaskListCardProps = {
  task: PayrollTask;
  t: Translate;
};

const categoryKeys = {
  driver: "settings.payrollTask.category.driver",
  kitchen: "settings.payrollTask.category.kitchen",
  operator: "settings.payrollTask.category.operator",
  warehouse: "settings.payrollTask.category.warehouse",
} as const;

const payRuleKeys = {
  churro_dough: "settings.payrollTask.payRule.churroDough",
  driver_direction: "settings.payrollTask.payRule.driverDirection",
  fixed: "settings.payrollTask.payRule.fixed",
  operator_hours: "settings.payrollTask.payRule.operatorHours",
} as const;

export function PayrollTaskListCard({ task, t }: PayrollTaskListCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-cyan-200">{task.name}</h2>
            <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">
              {t(categoryKeys[task.category])}
            </span>
            {!task.isActive ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">{t("settings.product.status.inactive")}</span> : null}
          </div>
          <p className="mt-2 text-sm font-bold text-zinc-400">
            {t(payRuleKeys[task.payRule])} / {formatMoneyMxn(task.baseAmountMxn)}
          </p>
        </div>
        <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/settings/payroll-tasks/${task.id}/edit`}>
          <Pencil aria-hidden="true" size={16} />
          {t("settings.product.action.edit")}
        </Link>
      </div>
    </article>
  );
}
