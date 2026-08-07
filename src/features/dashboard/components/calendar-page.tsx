"use client";

import { useTranslation } from "@/core/i18n";

import { CalendarWorkspace } from "./calendar-workspace";

export function CalendarPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("dashboard.calendar.title")}
          </h1>
          <p className="mt-2 text-base font-medium text-zinc-500">
            {t("dashboard.calendar.subtitle")}
          </p>
        </header>
        <CalendarWorkspace />
      </div>
    </main>
  );
}
