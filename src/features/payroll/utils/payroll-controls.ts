import type {
  PayrollFilters,
  PayrollPaymentHistoryItem,
  PayrollQueueItem,
} from "../types/payroll";

export const emptyPayrollFilters: PayrollFilters = {
  event: "",
  payDate: "",
  paymentMethod: "",
  staff: "",
  status: "",
};

export function filterPayrollItems(
  items: PayrollQueueItem[],
  filters: PayrollFilters,
) {
  return items.filter((item) => {
    const matchesStaff = !filters.staff || item.staffMemberId === filters.staff;
    const matchesEvent = !filters.event || item.eventId === filters.event;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesPayDate = !filters.payDate || item.scheduledPayDate === filters.payDate;
    return matchesStaff && matchesEvent && matchesStatus && matchesPayDate;
  });
}

export function filterPayrollPayments(
  payments: PayrollPaymentHistoryItem[],
  filters: PayrollFilters,
) {
  if (!filters.paymentMethod) return payments;
  return payments.filter((payment) => payment.paymentMethod === filters.paymentMethod);
}

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export function buildPayrollCsv(items: PayrollQueueItem[]) {
  const headers = [
    "Staff",
    "Task",
    "Client",
    "Venue",
    "Event Date",
    "Scheduled Pay Date",
    "Status",
    "Amount MXN",
  ];
  const rows = items.map((item) => [
    item.staffName,
    item.taskName,
    item.clientName,
    item.venueName,
    item.eventDate,
    item.scheduledPayDate,
    item.status,
    item.amountMxn,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => csvCell(value)).join(","))
    .join("\n");
}

export function downloadPayrollCsv(items: PayrollQueueItem[]) {
  const blob = new Blob([buildPayrollCsv(items)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "omds-payroll-export.csv";
  link.click();
  URL.revokeObjectURL(url);
}
