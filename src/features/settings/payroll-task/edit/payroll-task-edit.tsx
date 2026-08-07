"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";
import { EquipmentPageHeader } from "@/features/settings/equipment/components/equipment-page-header";

import { PayrollTaskForm } from "../components/payroll-task-form";
import { usePayrollTask } from "../hooks/use-payroll-task";
import { usePayrollTaskMutation } from "../hooks/use-payroll-task-mutation";
import type { PayrollTask, PayrollTaskFormValues } from "../types/payroll-task";

type PayrollTaskEditProps = { id: string };

const toFormValues = (task: PayrollTask): PayrollTaskFormValues => ({
  additionalUnitAmountMxn: task.additionalUnitAmountMxn,
  baseAmountMxn: task.baseAmountMxn,
  category: task.category,
  includedQuantity: task.includedQuantity,
  isActive: task.isActive,
  name: task.name,
  notes: task.notes,
  overtimeRateMxn: task.overtimeRateMxn,
  payRule: task.payRule,
  sortOrder: task.sortOrder,
  taskKey: task.taskKey,
  unitLabel: task.unitLabel,
});

export function PayrollTaskEdit({ id }: PayrollTaskEditProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const state = usePayrollTask(id);
  const mutation = usePayrollTaskMutation(id);

  if (state.isLoading) return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("settings.payrollTask.loading")}</main>;
  if (state.hasError || !state.task) return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("settings.payrollTask.loadError")}</main>;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <EquipmentPageHeader backLabel={t("settings.payrollTask.action.back")} title={t("settings.payrollTask.edit.title")} />
        <PayrollTaskForm
          cancelHref="/settings/payroll-tasks"
          errorKey="settings.payrollTask.edit.error"
          initialValues={toFormValues(state.task)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/payroll-tasks")}
          status={mutation.status}
          submitKey="settings.payrollTask.action.save"
          successKey="settings.payrollTask.edit.success"
        />
      </div>
    </main>
  );
}
