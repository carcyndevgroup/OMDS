"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";
import { EquipmentPageHeader } from "@/features/settings/equipment/components/equipment-page-header";

import { PayrollTaskForm } from "../components/payroll-task-form";
import { usePayrollTaskMutation } from "../hooks/use-payroll-task-mutation";
import { initialPayrollTaskFormValues } from "../schemas/payroll-task-schema";

export function PayrollTaskCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = usePayrollTaskMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <EquipmentPageHeader backLabel={t("settings.payrollTask.action.back")} title={t("settings.payrollTask.new.title")} />
        <PayrollTaskForm
          cancelHref="/settings/payroll-tasks"
          errorKey="settings.payrollTask.message.createError"
          initialValues={initialPayrollTaskFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/payroll-tasks")}
          status={mutation.status}
          submitKey="settings.payrollTask.action.create"
          successKey="settings.payrollTask.message.created"
        />
      </div>
    </main>
  );
}
