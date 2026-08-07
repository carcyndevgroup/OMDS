"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { useEquipmentList } from "../hooks/use-equipment-list";
import { EquipmentListCard } from "./equipment-list-card";

export function EquipmentList() {
  const { t } = useTranslation();
  const state = useEquipmentList();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/settings">
              <ArrowLeft aria-hidden="true" size={18} />
              {t("settings.equipment.action.back")}
            </Link>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("settings.equipment.title")}</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">{t("settings.equipment.subtitle")}</p>
          </div>
          <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" href="/settings/equipment/new">
            <Plus aria-hidden="true" size={18} />
            {t("settings.equipment.action.add")}
          </Link>
        </header>
        <section className="space-y-3">
          {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("settings.equipment.loading")}</p> : null}
          {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("settings.equipment.loadError")}</p> : null}
          {!state.isLoading && !state.hasError && !state.equipment.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{t("settings.equipment.empty")}</p>
          ) : null}
          {state.equipment.map((equipment) => (
            <EquipmentListCard equipment={equipment} key={equipment.id} t={t} />
          ))}
        </section>
      </div>
    </main>
  );
}
