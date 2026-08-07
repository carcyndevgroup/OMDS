"use client";

import { useTranslation } from "@/core/i18n";

import { usePlannerEvents } from "../hooks/use-planner-events";
import { PlannerEventCard } from "./planner-event-card";

type PlannerEventsSectionProps = { plannerId: string };

export function PlannerEventsSection({ plannerId }: PlannerEventsSectionProps) {
  const { locale, t } = useTranslation();
  const state = usePlannerEvents(plannerId);

  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6">
      <div>
        <h2 className="text-2xl font-bold">{t("crm.planner.event.title")}</h2>
        <p className="mt-2 text-sm font-medium text-zinc-500">
          {t("crm.planner.event.subtitle")}
        </p>
      </div>
      {state.isLoading ? (
        <p className="text-sm text-zinc-500">{t("crm.planner.event.loading")}</p>
      ) : null}
      {state.hasError ? (
        <p className="text-sm text-rose-300">{t("crm.planner.event.loadError")}</p>
      ) : null}
      {!state.isLoading && state.events.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm font-medium text-zinc-500">
          {t("crm.planner.event.empty")}
        </p>
      ) : null}
      <div className="grid gap-4">
        {state.events.map((event) => (
          <PlannerEventCard
            event={event}
            key={event.eventPlannerId}
            locale={locale}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
