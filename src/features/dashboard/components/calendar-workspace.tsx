"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useMonthEvents } from "../hooks/use-month-events";
import type { DashboardMonthEvent } from "../types/dashboard";
import { CalendarEventList } from "./calendar-event-list";
import { CalendarFilters } from "./calendar-filters";
import { getCalendarStatusClasses } from "./calendar-status-style";
import {
  buildCalendarDays,
  buildWeekDays,
  formatDayTitle,
  formatMonthDay,
  formatMonthTitle,
  getCurrentDateKey,
  getMonthFromDateKey,
  getWeekdays,
  groupEventsByDate,
  shiftDateKey,
  shiftMonth,
  type CalendarDayValue,
} from "./month-calendar-utils";

type CalendarView = "month" | "week" | "day";

export function CalendarWorkspace() {
  const { locale, t } = useTranslation();
  const [includeUnconfirmed, setIncludeUnconfirmed] = useState(false);
  const [view, setView] = useState<CalendarView>("month");
  const [cursorDate, setCursorDate] = useState(getCurrentDateKey());
  const month = getMonthFromDateKey(cursorDate);
  const state = useMonthEvents(month, includeUnconfirmed);
  const monthDays = useMemo(() => buildCalendarDays(month), [month]);
  const weekDays = useMemo(() => buildWeekDays(cursorDate), [cursorDate]);
  const eventsByDate = groupEventsByDate(state.items);
  const visibleEvents = getVisibleEvents(view, cursorDate, state.items, weekDays);

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/20">
      <CalendarToolbar
        cursorDate={cursorDate}
        locale={locale}
        onDateChange={setCursorDate}
        t={t}
        view={view}
      />
      <ViewTabs activeView={view} onChange={setView} t={t} />
      <CalendarFilters
        includeUnconfirmed={includeUnconfirmed}
        onChange={setIncludeUnconfirmed}
        t={t}
      />
      <div className="p-5">
        {view === "day" ? null : <WeekdayRow locale={locale} />}
        {view === "month" ? (
          <CalendarGrid days={monthDays} eventsByDate={eventsByDate} onSelect={setCursorDate} selectedDate={cursorDate} />
        ) : view === "week" ? (
          <CalendarGrid days={weekDays} eventsByDate={eventsByDate} onSelect={setCursorDate} selectedDate={cursorDate} />
        ) : null}
        <CalendarStatus hasError={state.hasError} isLoading={state.isLoading} t={t} />
        <CalendarEventList
          emptyKey={getEmptyKey(view)}
          events={visibleEvents}
          locale={locale}
          showDate={view !== "day"}
          t={t}
        />
      </div>
    </section>
  );
}

function CalendarToolbar(props: {
  cursorDate: string;
  locale: string;
  onDateChange: (date: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
  view: CalendarView;
}) {
  const { cursorDate, locale, onDateChange, t, view } = props;

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 p-5">
      <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={() => onDateChange(shiftCalendarCursor(cursorDate, view, -1))} type="button">
        <ChevronLeft aria-hidden="true" size={20} />
        <span className="sr-only">{t("dashboard.calendar.previous")}</span>
      </button>
      <h2 className="text-center text-xl font-black uppercase tracking-wider text-zinc-100">
        {getCalendarTitle(cursorDate, view, locale)}
      </h2>
      <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={() => onDateChange(shiftCalendarCursor(cursorDate, view, 1))} type="button">
        <ChevronRight aria-hidden="true" size={20} />
        <span className="sr-only">{t("dashboard.calendar.next")}</span>
      </button>
    </div>
  );
}

function ViewTabs(props: {
  activeView: CalendarView;
  onChange: (view: CalendarView) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const views: CalendarView[] = ["month", "week", "day"];

  return (
    <div className="flex gap-2 border-b border-zinc-800 px-5 py-4">
      {views.map((view) => (
        <button
          className={[
            "rounded-md px-4 py-2 text-sm font-bold transition",
            props.activeView === view ? "bg-cyan-300 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:text-white",
          ].join(" ")}
          key={view}
          onClick={() => props.onChange(view)}
          type="button"
        >
          {props.t(`dashboard.calendar.view.${view}`)}
        </button>
      ))}
    </div>
  );
}

function WeekdayRow({ locale }: { locale: string }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {getWeekdays(locale).map((day) => (
        <div className="text-center text-[11px] font-black uppercase text-zinc-500" key={day}>{day}</div>
      ))}
    </div>
  );
}

function CalendarGrid(props: {
  days: CalendarDayValue[];
  eventsByDate: Map<string, DashboardMonthEvent[]>;
  onSelect: (date: string) => void;
  selectedDate: string;
}) {
  return (
    <div className="mt-4 grid grid-cols-7 gap-2">
      {props.days.map((day) => (
        <CalendarDayButton {...props} day={day} key={day.dateKey} />
      ))}
    </div>
  );
}

function CalendarDayButton(props: {
  day: CalendarDayValue;
  eventsByDate: Map<string, DashboardMonthEvent[]>;
  onSelect: (date: string) => void;
  selectedDate: string;
}) {
  const events = props.eventsByDate.get(props.day.dateKey) ?? [];
  const primaryStatus = events.some((event) => event.bookingStatus === "confirmed")
    ? "confirmed"
    : events[0]?.bookingStatus ?? "";
  const style = getCalendarStatusClasses(primaryStatus);

  return (
    <button
      className={[
        "flex aspect-square min-h-14 flex-col items-center justify-center rounded-full border text-sm font-bold transition",
        props.day.isCurrentMonth ? "text-zinc-200" : "text-zinc-700",
        events.length ? style.day : "border-transparent bg-zinc-800/80",
        props.day.dateKey === props.selectedDate ? "ring-2 ring-cyan-200" : "",
        props.day.isToday ? "outline outline-2 outline-rose-300/70" : "",
      ].join(" ")}
      onClick={() => props.onSelect(props.day.dateKey)}
      type="button"
    >
      <span>{props.day.dayNumber}</span>
      <span className="mt-0.5 flex h-1.5 gap-0.5">
        {events.slice(0, 3).map((event) => (
          <span
            className={`h-1.5 w-1.5 rounded-full ${getCalendarStatusClasses(event.bookingStatus).dot}`}
            key={event.eventId}
          />
        ))}
      </span>
    </button>
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

function getVisibleEvents(
  view: CalendarView,
  cursorDate: string,
  events: DashboardMonthEvent[],
  weekDays: CalendarDayValue[],
) {
  if (view === "month") return events;
  if (view === "day") return events.filter((event) => event.eventDate === cursorDate);
  const weekDateKeys = new Set(weekDays.map((day) => day.dateKey));
  return events.filter((event) => weekDateKeys.has(event.eventDate));
}

function getCalendarTitle(dateKey: string, view: CalendarView, locale: string) {
  if (view === "month") return formatMonthTitle(getMonthFromDateKey(dateKey), locale);
  if (view === "day") return formatDayTitle(dateKey, locale);
  const week = buildWeekDays(dateKey);
  return `${formatMonthDay(week[0].dateKey, locale)} - ${formatMonthDay(week[6].dateKey, locale)}`;
}

function shiftCalendarCursor(dateKey: string, view: CalendarView, amount: number) {
  if (view === "month") return `${shiftMonth(getMonthFromDateKey(dateKey), amount)}-01`;
  return shiftDateKey(dateKey, view === "week" ? amount * 7 : amount);
}

function getEmptyKey(view: CalendarView) {
  if (view === "day") return "dashboard.calendar.emptyDay";
  if (view === "week") return "dashboard.calendar.emptyWeek";
  return "dashboard.calendar.empty";
}
