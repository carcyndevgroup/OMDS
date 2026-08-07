"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useMonthEvents } from "../hooks/use-month-events";
import type { DashboardMonthEvent } from "../types/dashboard";
import { CalendarEventList } from "./calendar-event-list";
import {
  buildCalendarDays,
  formatMonthTitle,
  getCurrentMonth,
  getWeekdays,
  groupEventsByDate,
  shiftMonth,
  type CalendarDayValue,
} from "./month-calendar-utils";

type MonthEventCalendarProps = {
  mode: "compact" | "full";
};

export function MonthEventCalendar({ mode }: MonthEventCalendarProps) {
  const { locale, t } = useTranslation();
  const [month, setMonth] = useState(getCurrentMonth());
  const state = useMonthEvents(month);
  const days = useMemo(() => buildCalendarDays(month), [month]);
  const eventsByDate = groupEventsByDate(state.items);

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/20">
      <CalendarHeader
        locale={locale}
        month={month}
        onChange={setMonth}
        t={t}
      />
      <div className={mode === "compact" ? "p-4" : "p-5"}>
        <WeekdayRow locale={locale} />
        <div className="mt-4 grid grid-cols-7 gap-2">
          {days.map((day) => (
            <CalendarDay
              day={day}
              events={eventsByDate.get(day.dateKey) ?? []}
              key={day.dateKey}
              mode={mode}
            />
          ))}
        </div>
        <CalendarStatus hasError={state.hasError} isLoading={state.isLoading} t={t} />
        {mode === "full" ? (
          <CalendarEventList
            emptyKey="dashboard.calendar.empty"
            events={state.items}
            locale={locale}
            showDate
            t={t}
          />
        ) : null}
      </div>
    </section>
  );
}

function CalendarHeader(props: {
  locale: string;
  month: string;
  onChange: (month: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { locale, month, onChange, t } = props;

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 p-5">
      <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={() => onChange(shiftMonth(month, -1))} type="button">
        <ChevronLeft aria-hidden="true" size={20} />
        <span className="sr-only">{t("dashboard.calendar.previous")}</span>
      </button>
      <h2 className="text-xl font-black uppercase tracking-wider text-zinc-100">
        {formatMonthTitle(month, locale)}
      </h2>
      <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={() => onChange(shiftMonth(month, 1))} type="button">
        <ChevronRight aria-hidden="true" size={20} />
        <span className="sr-only">{t("dashboard.calendar.next")}</span>
      </button>
    </div>
  );
}

function WeekdayRow({ locale }: { locale: string }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {getWeekdays(locale).map((day) => (
        <div className="text-center text-[11px] font-black uppercase text-zinc-500" key={day}>
          {day}
        </div>
      ))}
    </div>
  );
}

function CalendarDay(props: {
  day: CalendarDayValue;
  events: DashboardMonthEvent[];
  mode: "compact" | "full";
}) {
  const { day, events, mode } = props;
  const hasEvents = events.length > 0;

  return (
    <Link
      className={[
        "flex flex-col items-center justify-center rounded-full border text-sm font-bold transition",
        mode === "compact" ? "h-10 min-w-10" : "aspect-square min-h-14",
        day.isCurrentMonth ? "text-zinc-200" : "text-zinc-700",
        hasEvents ? "border-cyan-300/50 bg-cyan-300/20 text-cyan-100" : "border-transparent bg-zinc-800/80",
        day.isToday ? "ring-2 ring-rose-300/80" : "",
      ].join(" ")}
      href={hasEvents ? `/crm/events/${events[0].eventId}` : "/calendar"}
    >
      <span>{day.dayNumber}</span>
      <span className="mt-0.5 flex h-1.5 gap-0.5">
        {events.slice(0, 3).map((event) => (
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-200" key={event.eventId} />
        ))}
      </span>
    </Link>
  );
}

function CalendarStatus(props: {
  hasError: boolean;
  isLoading: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (props.isLoading) return <p className="mt-4 text-sm text-zinc-500">{props.t("dashboard.calendar.loading")}</p>;
  if (props.hasError) return <p className="mt-4 text-sm text-rose-300">{props.t("dashboard.calendar.error")}</p>;
  return null;
}
