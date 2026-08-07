"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { useEvent } from "../hooks/use-event";
import { EventRunSheetPrintDocument } from "./event-run-sheet-print-document";

type EventRunSheetPrintPageProps = {
  id: string;
};

export function EventRunSheetPrintPage({ id }: EventRunSheetPrintPageProps) {
  const { locale, t } = useTranslation();
  const state = useEvent(id);

  if (state.isLoading) {
    return (
      <main className="min-h-screen bg-white px-4 py-12 text-center text-sm font-semibold text-zinc-500">
        {t("crm.event.list.loading")}
      </main>
    );
  }

  if (state.hasError || !state.event) {
    return (
      <main className="min-h-screen bg-white px-4 py-12 text-center text-sm font-semibold text-rose-600">
        {t("crm.event.list.loadError")}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 print:bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4 print:hidden">
        <Link
          className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-black text-zinc-800 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700"
          href={`/crm/events/${id}`}
        >
          <ArrowLeft aria-hidden="true" size={16} />
          {t("crm.event.runSheet.print.back")}
        </Link>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-black text-zinc-950 shadow-sm transition hover:bg-cyan-200"
          onClick={() => window.print()}
          type="button"
        >
          <Printer aria-hidden="true" size={16} />
          {t("crm.event.runSheet.print.open")}
        </button>
      </div>
      <EventRunSheetPrintDocument event={state.event} locale={locale} t={t} />
    </main>
  );
}
