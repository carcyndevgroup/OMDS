import type { PayrollPeriodSummary, PayrollQueueItem } from "../types/payroll";

const money = (value: number) => value.toFixed(2);

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const endOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};

const nextWednesday = () => {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = (3 - current.getDay() + 7) % 7;
  current.setDate(current.getDate() + offset);
  return current;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

function summarize(
  title: string,
  startDate: Date,
  endDate: Date,
  items: PayrollQueueItem[],
): PayrollPeriodSummary {
  const start = isoDate(startDate);
  const end = isoDate(endDate);
  const periodItems = items.filter((item) => {
    const date = item.scheduledPayDate || item.eventDate;
    return Boolean(date) && date >= start && date <= end;
  });
  const paid = periodItems
    .filter((item) => item.status === "paid")
    .reduce((total, item) => total + Number(item.amountMxn), 0);
  const total = periodItems.reduce((sum, item) => sum + Number(item.amountMxn), 0);

  return {
    endDate: end,
    paidMxn: money(paid),
    pendingMxn: money(total - paid),
    startDate: start,
    title,
    totalMxn: money(total),
  };
}

export function buildPayrollPeriodSummaries(items: PayrollQueueItem[]) {
  const firstWednesday = nextWednesday();
  const weeklySummaries = Array.from({ length: 4 }, (_, index) => {
    const endDate = addDays(firstWednesday, index * 7);
    const startDate = addDays(endDate, -6);
    return summarize("weekly", startDate, endDate, items);
  });

  return [
    summarize("currentMonth", startOfMonth(), endOfMonth(), items),
    ...weeklySummaries,
  ];
}
