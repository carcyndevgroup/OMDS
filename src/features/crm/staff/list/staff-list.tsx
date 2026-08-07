"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { useStaffList } from "../hooks/use-staff-list";
import { StaffListCard } from "./staff-list-card";

export function StaffList() {
  const { t } = useTranslation();
  const state = useStaffList();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("crm.staff.list.title")}</h1>
          <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" href="/crm/staff/new">
            <Plus aria-hidden="true" size={18} />
            {t("crm.staff.action.add")}
          </Link>
        </header>
        <section className="space-y-3">
          {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("crm.staff.list.loading")}</p> : null}
          {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("crm.staff.list.loadError")}</p> : null}
          {!state.isLoading && !state.hasError && !state.staff.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{t("crm.staff.list.empty")}</p>
          ) : null}
          {state.staff.map((staff) => (
            <StaffListCard key={staff.id} staff={staff} t={t} />
          ))}
        </section>
      </div>
    </main>
  );
}
