"use client";

import { AlertTriangle, Banknote, CalendarCheck2, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import { usePayrollDashboard } from "../hooks/use-payroll-dashboard";
import { usePayrollBatchMutation } from "../hooks/use-payroll-batch-mutation";
import { usePayrollPaymentMutation } from "../hooks/use-payroll-payment-mutation";
import { usePayrollPaymentHistory } from "../hooks/use-payroll-payment-history";
import type { PayrollQueueItem } from "../types/payroll";
import { groupPayrollItems } from "../repositories/payroll-dashboard-calculations";
import {
  downloadPayrollCsv,
  emptyPayrollFilters,
  filterPayrollItems,
  filterPayrollPayments,
} from "../utils/payroll-controls";
import { buildPayrollPeriodSummaries } from "../utils/payroll-period-summaries";
import { PayrollBatchActionBar } from "./payroll-batch-action-bar";
import { PayrollControls } from "./payroll-controls";
import { PayrollPayDateGroup } from "./payroll-pay-date-group";
import { PayrollPaymentActionBar } from "./payroll-payment-action-bar";
import { PayrollPaymentHistory } from "./payroll-payment-history";
import { PayrollPeriodSummaries } from "./payroll-period-summaries";
import { PayrollSummaryCard } from "./payroll-summary-card";

export function PayrollDashboard() {
  const { locale, t } = useTranslation();
  const { dashboard, hasError, isLoading, refresh } = usePayrollDashboard();
  const paymentHistory = usePayrollPaymentHistory();
  const batchMutation = usePayrollBatchMutation();
  const paymentMutation = usePayrollPaymentMutation();
  const [filters, setFilters] = useState(emptyPayrollFilters);
  const [scheduledPayDate, setScheduledPayDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const cards = [
    { icon: CalendarCheck2, label: t("payroll.summary.dueThisWednesday"), value: dashboard.summary.dueThisWednesdayMxn },
    { icon: AlertTriangle, label: t("payroll.summary.overdue"), value: dashboard.summary.overdueMxn },
    { icon: Banknote, label: t("payroll.summary.paidThisPeriod"), value: dashboard.summary.paidThisPeriodMxn },
    { icon: WalletCards, label: t("payroll.summary.totalPending"), value: dashboard.summary.totalPendingMxn },
  ];
  const selectedItems = useMemo(() => {
    return dashboard.items.filter((item) => selectedIds.has(item.id));
  }, [dashboard.items, selectedIds]);
  const filteredItems = useMemo(() => {
    return filterPayrollItems(dashboard.items, filters);
  }, [dashboard.items, filters]);
  const filteredGroups = useMemo(() => groupPayrollItems(filteredItems), [filteredItems]);
  const filteredPayments = useMemo(() => {
    return filterPayrollPayments(paymentHistory.payments, filters);
  }, [paymentHistory.payments, filters]);
  const periodSummaries = useMemo(() => {
    return buildPayrollPeriodSummaries(filteredItems);
  }, [filteredItems]);
  const selectedTotal = selectedItems.reduce((total, item) => {
    return total + Number(item.amountMxn);
  }, 0);
  const selectedKind = selectedItems[0]?.status === "scheduled" ? "payment" : "batch";
  const defaultReceivingAccount = (() => {
    if (!selectedItems.length) return "";
    const staffIds = new Set(selectedItems.map((item) => item.staffMemberId));
    return staffIds.size === 1 ? selectedItems[0].receivingAccountDefault : "";
  })();
  const hasMissingReceivingAccount = selectedItems.some((item) => !item.receivingAccountDefault);

  const toggleSelected = (id: string) => {
    const item = dashboard.items.find((entry) => entry.id === id);
    if (!item) return;
    const itemKind = item.status === "scheduled" ? "payment" : "batch";

    setSelectedIds((current) => {
      const next = new Set(current);
      const currentItem = dashboard.items.find((entry) => next.has(entry.id));
      const currentKind = currentItem?.status === "scheduled" ? "payment" : "batch";
      if (current.size && currentKind !== itemKind) return new Set([id]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const firstSelectedDate = (items: PayrollQueueItem[]) => items[0]?.scheduledPayDate ?? "";

  const createBatch = async () => {
    const targetDate = scheduledPayDate || firstSelectedDate(selectedItems);
    if (!targetDate || !selectedItems.length) return;

    await batchMutation.createBatch({
      lineItemIds: selectedItems.map((item) => item.id),
      scheduledPayDate: targetDate,
    });
    setSelectedIds(new Set());
    setScheduledPayDate("");
    await refresh();
  };

  const recordPayment = async (values: Parameters<typeof paymentMutation.recordPayment>[1]) => {
    if (!selectedItems.length) return;
    await paymentMutation.recordPayment(
      selectedItems.map((item) => item.id),
      values,
    );
    setSelectedIds(new Set());
    await refresh();
    await paymentHistory.refresh();
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold sm:text-4xl">{t("payroll.title")}</h1>
          <p className="mt-2 max-w-3xl text-base font-medium text-zinc-500">{t("payroll.subtitle")}</p>
        </header>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <PayrollSummaryCard
              icon={card.icon}
              key={card.label}
              label={card.label}
              value={formatMoneyMxn(card.value)}
            />
          ))}
        </section>
        <PayrollControls
          filters={filters}
          items={dashboard.items}
          onChange={setFilters}
          onClear={() => setFilters(emptyPayrollFilters)}
          onExport={() => downloadPayrollCsv(filteredItems)}
          t={t}
        />
        <PayrollPeriodSummaries locale={locale} summaries={periodSummaries} t={t} />
        {selectedItems.length && selectedKind === "batch" ? (
          <PayrollBatchActionBar
            isDisabled={batchMutation.status === "loading"}
            onCreate={createBatch}
            onDateChange={setScheduledPayDate}
            scheduledPayDate={scheduledPayDate || firstSelectedDate(selectedItems)}
            selectedCount={selectedItems.length}
            selectedTotalMxn={selectedTotal.toFixed(2)}
            t={t}
          />
        ) : null}
        {selectedItems.length && selectedKind === "payment" ? (
          <PayrollPaymentActionBar
            defaultReceivingAccount={defaultReceivingAccount}
            hasMissingReceivingAccount={hasMissingReceivingAccount}
            isDisabled={paymentMutation.status === "loading"}
            onRecord={recordPayment}
            selectedCount={selectedItems.length}
            selectedTotalMxn={selectedTotal.toFixed(2)}
            t={t}
          />
        ) : null}
        <section className="space-y-3">
          {isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("payroll.loading")}</p> : null}
          {hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("payroll.loadError")}</p> : null}
          {!isLoading && !hasError && !filteredItems.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
              {t("payroll.empty")}
            </p>
          ) : null}
          {filteredGroups.map((group) => (
            <PayrollPayDateGroup
              group={group}
              key={group.scheduledPayDate || "unscheduled"}
              locale={locale}
              onToggle={toggleSelected}
              selectedIds={selectedIds}
              t={t}
            />
          ))}
        </section>
        <PayrollPaymentHistory
          hasError={paymentHistory.hasError}
          isLoading={paymentHistory.isLoading}
          locale={locale}
          payments={filteredPayments}
          t={t}
        />
      </div>
    </main>
  );
}
