import type { Database } from "@/core/supabase/database.types";

import type { PayrollDashboard, PayrollStatus } from "../types/payroll";

type PayrollRow = Database["public"]["Tables"]["event_payroll_line_items"]["Row"];

export const emptySummary = {
  approvedMxn: "0",
  dueThisWednesdayMxn: "0",
  estimatedMxn: "0",
  paidMxn: "0",
  paidThisPeriodMxn: "0",
  totalPendingMxn: "0",
  overdueMxn: "0",
  unpaidMxn: "0",
  waivedMxn: "0",
};

export const money = (value: number) => value.toFixed(2);

const sumByStatus = (rows: PayrollRow[], status: PayrollStatus) =>
  rows
    .filter((row) => row.status === status)
    .reduce((total, row) => total + Number(row.total_mxn), 0);

const todayIso = () => new Date().toISOString().slice(0, 10);

const nextWednesdayIso = () => {
  const current = new Date(`${todayIso()}T00:00:00`);
  const offset = (3 - current.getDay() + 7) % 7;
  current.setDate(current.getDate() + offset);
  return current.toISOString().slice(0, 10);
};

const monthStartIso = () => {
  const current = new Date(`${todayIso()}T00:00:00`);
  return new Date(current.getFullYear(), current.getMonth(), 1).toISOString().slice(0, 10);
};

const sumRows = (rows: PayrollRow[]) =>
  rows.reduce((total, row) => total + Number(row.total_mxn), 0);

const payableStatuses = new Set<PayrollStatus>(["approved", "scheduled"]);
const pendingStatuses = new Set<PayrollStatus>(["approved", "estimated", "scheduled"]);

export function buildPayrollSummary(rows: PayrollRow[]): PayrollDashboard["summary"] {
  const today = todayIso();
  const thisWednesday = nextWednesdayIso();
  const monthStart = monthStartIso();
  const pendingRows = rows.filter((row) => pendingStatuses.has(row.status as PayrollStatus));
  const payableRows = rows.filter((row) => payableStatuses.has(row.status as PayrollStatus));
  const dueThisWednesdayRows = payableRows.filter((row) => row.scheduled_pay_date === thisWednesday);
  const overdueRows = payableRows.filter((row) => {
    return Boolean(row.scheduled_pay_date) && String(row.scheduled_pay_date) < today;
  });
  const paidThisPeriodRows = rows.filter((row) => {
    return row.status === "paid" && Boolean(row.paid_at) && String(row.paid_at).slice(0, 10) >= monthStart;
  });

  return {
    approvedMxn: money(sumByStatus(rows, "approved")),
    dueThisWednesdayMxn: money(sumRows(dueThisWednesdayRows)),
    estimatedMxn: money(sumByStatus(rows, "estimated")),
    paidMxn: money(sumByStatus(rows, "paid")),
    paidThisPeriodMxn: money(sumRows(paidThisPeriodRows)),
    totalPendingMxn: money(sumRows(pendingRows)),
    overdueMxn: money(sumRows(overdueRows)),
    unpaidMxn: money(
      sumByStatus(rows, "approved") +
        sumByStatus(rows, "estimated") +
        sumByStatus(rows, "scheduled"),
    ),
    waivedMxn: money(sumByStatus(rows, "waived")),
  };
}

export function groupPayrollItems(rows: PayrollDashboard["items"]): PayrollDashboard["groups"] {
  const dateMap = new Map<string, PayrollDashboard["items"]>();

  rows.forEach((row) => {
    const key = row.scheduledPayDate || "";
    dateMap.set(key, [...(dateMap.get(key) ?? []), row]);
  });

  return Array.from(dateMap.entries()).map(([scheduledPayDate, dateRows]) => {
    const staffMap = new Map<string, PayrollDashboard["items"]>();

    dateRows.forEach((row) => {
      const key = row.staffMemberId || row.staffName || "unknown";
      staffMap.set(key, [...(staffMap.get(key) ?? []), row]);
    });

    const staffGroups = Array.from(staffMap.entries()).map(([staffMemberId, staffRows]) => ({
      items: staffRows,
      staffMemberId,
      staffName: staffRows[0]?.staffName ?? "",
      totalMxn: money(staffRows.reduce((total, row) => total + Number(row.amountMxn), 0)),
    }));

    return {
      scheduledPayDate,
      staffGroups,
      totalMxn: money(dateRows.reduce((total, row) => total + Number(row.amountMxn), 0)),
    };
  });
}
