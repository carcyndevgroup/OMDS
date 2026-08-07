"use client";

import { useTranslation } from "@/core/i18n";

import { useDashboardSummary } from "../hooks/use-dashboard-summary";
import { usePendingQuestionnaires } from "../hooks/use-pending-questionnaires";
import { useUpcomingEvents } from "../hooks/use-upcoming-events";
import { DashboardSummaryCards } from "./dashboard-summary-cards";
import { MonthEventCalendar } from "./month-event-calendar";
import { PendingQuestionnairesPanel } from "./pending-questionnaires-panel";
import { UpcomingEventsPanel } from "./upcoming-events-panel";

export function DashboardHome() {
  const { locale, t } = useTranslation();
  const pendingQuestionnaires = usePendingQuestionnaires();
  const summary = useDashboardSummary();
  const upcomingEvents = useUpcomingEvents();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("dashboard.title")}
          </h1>
          <p className="mt-2 text-base font-medium text-zinc-500">
            {t("dashboard.subtitle")}
          </p>
        </header>

        <DashboardSummaryCards
          hasError={summary.hasError}
          isLoading={summary.isLoading}
          summary={summary.summary}
          t={t}
        />

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <PendingQuestionnairesPanel
            hasError={pendingQuestionnaires.hasError}
            isLoading={pendingQuestionnaires.isLoading}
            items={pendingQuestionnaires.items}
            locale={locale}
            t={t}
          />
          <div className="space-y-5">
            <MonthEventCalendar mode="compact" />
            <UpcomingEventsPanel
              hasError={upcomingEvents.hasError}
              isLoading={upcomingEvents.isLoading}
              items={upcomingEvents.items}
              locale={locale}
              t={t}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
