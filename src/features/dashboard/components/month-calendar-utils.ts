import type { DashboardMonthEvent } from "../types/dashboard";
import { parseDateOnly } from "./dashboard-format";

export type CalendarDayValue = {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function buildWeekDays(dateKey: string): CalendarDayValue[] {
  const selectedDate = parseDateOnly(dateKey);
  const start = new Date(selectedDate);
  start.setDate(selectedDate.getDate() - selectedDate.getDay());
  const month = selectedDate.getMonth();
  const today = getTodayKey();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const nextDateKey = toDateKey(date);

    return {
      dateKey: nextDateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: nextDateKey === today,
    };
  });
}

export function buildCalendarDays(month: string): CalendarDayValue[] {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const today = getTodayKey();

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toDateKey(date);

    return {
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === monthIndex - 1,
      isToday: dateKey === today,
    };
  });
}

export function groupEventsByDate(events: DashboardMonthEvent[]) {
  return events.reduce((map, event) => {
    const existing = map.get(event.eventDate) ?? [];
    map.set(event.eventDate, [...existing, event]);
    return map;
  }, new Map<string, DashboardMonthEvent[]>());
}

export function getCurrentMonth() {
  return getTodayKey().slice(0, 7);
}

export function getCurrentDateKey() {
  return getTodayKey();
}

export function getMonthFromDateKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

export function shiftDateKey(dateKey: string, amount: number) {
  const date = parseDateOnly(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function shiftMonth(month: string, amount: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthTitle(month: string, locale: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));
}

export function formatMonthDay(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(parseDateOnly(value));
}

export function formatDayTitle(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "full",
  }).format(parseDateOnly(value));
}

export function getWeekdays(locale: string) {
  const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    weekday: "short",
  });
  return Array.from({ length: 7 }, (_, day) =>
    formatter.format(new Date(2026, 2, day + 1)),
  );
}

function getTodayKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Cancun",
    year: "numeric",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
