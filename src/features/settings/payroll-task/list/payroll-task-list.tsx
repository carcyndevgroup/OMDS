"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { usePayrollTaskList } from "../hooks/use-payroll-task-list";
import { PayrollTaskListCard } from "./payroll-task-list-card";

export function PayrollTaskList() {
  const { t } = useTranslation();
  const state = usePayrollTaskList();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/settings">
              <ArrowLeft aria-hidden="true" size={18} />
              {t("settings.payrollTask.action.back")}
            </Link>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("settings.payrollTask.title")}</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">{t("settings.payrollTask.subtitle")}</p>
          </div>
          <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" href="/settings/payroll-tasks/new">
            <Plus aria-hidden="true" size={18} />
            {t("settings.payrollTask.action.add")}
          </Link>
        </header>
        <section className="space-y-3">
          {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("settings.payrollTask.loading")}</p> : null}
          {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("settings.payrollTask.loadError")}</p> : null}
          {!state.isLoading && !state.hasError && !state.tasks.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{t("settings.payrollTask.empty")}</p>
          ) : null}
          {state.tasks.map((task) => (
            <PayrollTaskListCard key={task.id} task={task} t={t} />
          ))}
        </section>
      </div>
    </main>
  );
}
