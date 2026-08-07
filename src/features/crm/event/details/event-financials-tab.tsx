"use client";

import { FileText, ReceiptText, TrendingUp } from "lucide-react";

import { EventCommissionsSection } from "../../financials/components/event-commissions-section";
import { EventExpensesSection } from "../../financials/components/event-expenses-section";
import { EventPayrollLineItemSection } from "../../financials/components/event-payroll-line-item-section";
import { EventSatFacturaSection } from "../../financials/components/event-sat-factura-section";
import { useEventCommissionMutation } from "../../financials/hooks/use-event-commission-mutation";
import { useEventCommissions } from "../../financials/hooks/use-event-commissions";
import { useEventExpenseMutation } from "../../financials/hooks/use-event-expense-mutation";
import { useEventExpenses } from "../../financials/hooks/use-event-expenses";
import { useEventPayrollLineItemMutation } from "../../financials/hooks/use-event-payroll-line-item-mutation";
import { useEventPayrollLineItems } from "../../financials/hooks/use-event-payroll-line-items";
import type { EventCommissionFormValues } from "../../financials/types/event-commission";
import type { EventExpenseFormValues } from "../../financials/types/event-expense";
import type { EventPayrollLineItemFormValues } from "../../financials/types/event-payroll-line-item";
import { useInvoices } from "../../invoice/hooks/use-invoices";
import type { Invoice } from "../../invoice/types/invoice";
import { useEventQuotes } from "../../quote/hooks/use-event-quotes";
import type { QuoteVersion } from "../../quote/types/quote";
import { getQuoteDiscountAmountMxn } from "../../quote/utils/quote-money";
import { formatMoneyMxn } from "../../shared/utils/money-format";
import {
  InvoiceFinancialCard,
  MetricCard,
  SummaryRow,
} from "./event-financial-cards";
import { EventDetailSection } from "./event-detail-section";
import type { EventDetailSectionProps } from "./event-detail-types";

const versionCog = (version: QuoteVersion | null) => {
  if (!version) return 0;
  return version.items.reduce((total, item) => {
    return total + Number(item.cogMxn) * Number(item.quantity);
  }, 0);
};

const invoiceSum = (invoices: Invoice[], predicate: (invoice: Invoice) => boolean) => {
  return invoices.filter(predicate).reduce((total, invoice) => {
    return total + Number(invoice.totalMxn);
  }, 0);
};

export function EventFinancialsTab({ event, t }: EventDetailSectionProps) {
  const commissionState = useEventCommissions(event.eventId);
  const commissionMutation = useEventCommissionMutation(event.eventId);
  const expenseState = useEventExpenses(event.eventId);
  const expenseMutation = useEventExpenseMutation(event.eventId);
  const payrollState = useEventPayrollLineItems(event.eventId);
  const payrollMutation = useEventPayrollLineItemMutation(event.eventId);
  const invoiceState = useInvoices(event.eventId);
  const quoteState = useEventQuotes(event.eventId);
  const acceptedQuote = quoteState.quotes.find((quote) => quote.status === "accepted");
  const acceptedVersion = acceptedQuote?.currentVersion ?? null;
  const revenue = Number(acceptedVersion?.totalMxn ?? 0);
  const cog = versionCog(acceptedVersion);
  const tax = Number(acceptedVersion?.taxTotalMxn ?? 0);
  const discount = acceptedVersion ? getQuoteDiscountAmountMxn(acceptedVersion) : 0;
  const commissions = commissionState.commissions.reduce((total, commission) => {
    return total + Number(commission.amountMxn);
  }, 0);
  const staffPayroll = payrollState.lineItems.reduce((total, payroll) => {
    return total + Number(payroll.totalMxn);
  }, 0);
  const expenses = expenseState.expenses.reduce((total, expense) => {
    return total + Number(expense.amountMxn);
  }, 0);
  const grossProfit = revenue - cog;
  const netProfit = grossProfit - commissions - staffPayroll - expenses;
  const paid = invoiceSum(invoiceState.invoices, (invoice) => invoice.status === "paid");
  const outstanding = invoiceSum(invoiceState.invoices, (invoice) => {
    return invoice.status !== "paid" && invoice.status !== "void";
  });
  const shouldShowSat =
    event.bookingType === "preferred_vendor" ||
    event.venueRequiresSatFiscal ||
    Boolean(event.paymentPartnerName);

  const saveCommission = async (
    values: EventCommissionFormValues,
    commissionId?: string,
  ) => {
    await commissionMutation.save(values, commissionId);
    await commissionState.refresh();
  };

  const removeCommission = async (commissionId: string) => {
    await commissionMutation.remove(commissionId);
    await commissionState.refresh();
  };

  const savePayroll = async (
    values: EventPayrollLineItemFormValues,
    lineItemId?: string,
  ) => {
    await payrollMutation.save(values, lineItemId);
    await payrollState.refresh();
  };

  const removePayroll = async (payrollId: string) => {
    await payrollMutation.remove(payrollId);
    await payrollState.refresh();
  };

  const approvePayroll = async (payrollId: string) => {
    await payrollMutation.approve(payrollId);
    await payrollState.refresh();
  };

  const saveExpense = async (
    values: EventExpenseFormValues,
    expenseId?: string,
  ) => {
    await expenseMutation.save(values, expenseId);
    await expenseState.refresh();
  };

  const removeExpense = async (expenseId: string) => {
    await expenseMutation.remove(expenseId);
    await expenseState.refresh();
  };

  return (
    <div className="space-y-5">
      <EventDetailSection title={t("crm.invoice.financials.title")}>
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard icon={<TrendingUp size={18} />} label={t("crm.invoice.financials.revenue")} value={formatMoneyMxn(revenue)} />
          <MetricCard icon={<ReceiptText size={18} />} label={t("crm.invoice.financials.tax")} value={formatMoneyMxn(tax)} />
          <MetricCard icon={<ReceiptText size={18} />} label={t("crm.invoice.financials.estimatedCog")} value={formatMoneyMxn(cog)} />
          <MetricCard icon={<ReceiptText size={18} />} label={t("crm.commission.total")} value={formatMoneyMxn(commissions)} />
          <MetricCard icon={<ReceiptText size={18} />} label={t("crm.payroll.total")} value={formatMoneyMxn(staffPayroll)} />
          <MetricCard icon={<ReceiptText size={18} />} label={t("crm.expense.total")} value={formatMoneyMxn(expenses)} />
          <MetricCard icon={<TrendingUp size={18} />} label={t("crm.invoice.financials.grossProfit")} value={formatMoneyMxn(grossProfit)} />
          <MetricCard icon={<TrendingUp size={18} />} label={t("crm.invoice.financials.netProfit")} value={formatMoneyMxn(netProfit)} />
        </div>
      </EventDetailSection>

      <EventDetailSection title={t("crm.commission.title")}>
        <EventCommissionsSection
          commissions={commissionState.commissions}
          hasError={commissionState.hasError}
          isLoading={commissionState.isLoading}
          onRemove={removeCommission}
          onSave={saveCommission}
          t={t}
        />
      </EventDetailSection>

      <EventDetailSection title={t("crm.expense.title")}>
        <EventExpensesSection
          expenses={expenseState.expenses}
          hasError={expenseState.hasError}
          isLoading={expenseState.isLoading}
          onRemove={removeExpense}
          onSave={saveExpense}
          t={t}
        />
      </EventDetailSection>

      <EventDetailSection title={t("crm.payroll.title")}>
        <EventPayrollLineItemSection
          hasError={payrollState.hasError}
          isLoading={payrollState.isLoading}
          lineItems={payrollState.lineItems}
          onApprove={approvePayroll}
          onRemove={removePayroll}
          onSave={savePayroll}
          t={t}
        />
      </EventDetailSection>

      <EventDetailSection title={t("crm.invoice.financials.invoiceSummary")}>
        {invoiceState.isLoading || quoteState.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.invoice.loading")}</p>
        ) : null}
        {invoiceState.hasError || quoteState.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.invoice.loadError")}</p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <MetricCard icon={<FileText size={18} />} label={t("crm.invoice.financials.paid")} value={formatMoneyMxn(paid)} />
          <MetricCard icon={<FileText size={18} />} label={t("crm.invoice.financials.outstanding")} value={formatMoneyMxn(outstanding)} />
        </div>
        {acceptedVersion ? (
          <div className="mt-4 grid gap-2 rounded-md border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
            <SummaryRow label={t("crm.quote.total.items")} value={formatMoneyMxn(acceptedVersion.itemsTotalMxn)} />
            {discount > 0 ? (
              <SummaryRow label={t("crm.quote.total.discount")} value={formatMoneyMxn(discount)} />
            ) : null}
            <SummaryRow label={t("crm.quote.total.subtotal")} value={formatMoneyMxn(acceptedVersion.subtotalMxn)} />
            <SummaryRow label={t("crm.quote.total.tax")} value={formatMoneyMxn(acceptedVersion.taxTotalMxn)} />
            <SummaryRow isStrong label={t("crm.quote.total.total")} value={formatMoneyMxn(acceptedVersion.totalMxn)} />
          </div>
        ) : null}
        {!invoiceState.isLoading && invoiceState.invoices.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">
            {t("crm.invoice.empty")}
          </p>
        ) : null}
        <div className="mt-4 space-y-3">
          {invoiceState.invoices.map((invoice) => (
            <InvoiceFinancialCard invoice={invoice} key={invoice.id} t={t} />
          ))}
        </div>
      </EventDetailSection>

      {shouldShowSat ? (
        <EventDetailSection title={t("crm.sat.title")}>
          <EventSatFacturaSection
            eventId={event.eventId}
            facturaRecipient={event.facturaRecipient}
            invoiceBehavior={event.venueInvoiceBehavior}
            t={t}
          />
        </EventDetailSection>
      ) : null}
    </div>
  );
}
