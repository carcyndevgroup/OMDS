import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { syncClientPortalAccess } from "../../portal/repositories/client-portal-repository";
import { findPaymentPlan } from "../../../settings/payment-plan/repositories/payment-plan-repository";
import type { InvoiceType } from "../types/invoice";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type QuoteItemRow = Database["public"]["Tables"]["quote_items"]["Row"];
type QuoteVersionRow = Database["public"]["Tables"]["quote_versions"]["Row"];

type PaymentPlanRecord = {
  finalDueDaysBeforeEvent: string;
  finalDueRule: "days_before_event" | "none";
  finalPaymentPercent: string;
  retainerGracePeriodDays: string;
  retainerPercent: string;
};

export async function createInvoicesFromAcceptedQuotePlan(props: {
  contractId: string;
  database: SupabaseClient<Database>;
  eventDate: string | null;
  eventId: string;
  invoiceType: InvoiceType;
  quoteVersion: QuoteVersionRow;
}) {
  const plan = await resolvePaymentPlan(props.database, props.quoteVersion.payment_plan_id);
  const plannedInvoices = buildPlannedInvoices({
    contractId: props.contractId,
    displayCurrency: props.quoteVersion.display_currency,
    eventDate: props.eventDate,
    eventId: props.eventId,
    invoiceType: props.invoiceType,
    paymentPlan: plan,
    quoteVersionId: props.quoteVersion.id,
    sourceTotals: {
      subtotalMxn: props.quoteVersion.subtotal_mxn,
      taxTotalMxn: props.quoteVersion.tax_total_mxn,
      totalMxn: props.quoteVersion.total_mxn,
    },
  });

  for (const plannedInvoice of plannedInvoices) {
    const result = await props.database
      .from("invoices")
      .upsert(plannedInvoice, { onConflict: "event_id,invoice_type,installment_key" })
      .select("*")
      .single();
    if (result.error) throw result.error;

    await replacePlannedInvoiceItems(props.database, result.data, plannedInvoice.installment_key);
  }

  await syncClientPortalAccess(props.database, props.eventId);
}

async function resolvePaymentPlan(database: SupabaseClient<Database>, paymentPlanId: string | null) {
  const plan = paymentPlanId ? await findPaymentPlan(database, paymentPlanId) : await findDefaultPaymentPlan(database);
  if (plan) {
    return {
      finalDueDaysBeforeEvent: plan.finalDueDaysBeforeEvent,
      finalDueRule: plan.finalDueRule,
      finalPaymentPercent: plan.finalPaymentPercent,
      retainerGracePeriodDays: plan.retainerGracePeriodDays,
      retainerPercent: plan.retainerPercent,
    } satisfies PaymentPlanRecord;
  }

  return {
    finalDueDaysBeforeEvent: "14",
    finalDueRule: "days_before_event",
    finalPaymentPercent: "60.00",
    retainerGracePeriodDays: "3",
    retainerPercent: "40.00",
  } satisfies PaymentPlanRecord;
}

async function findDefaultPaymentPlan(database: SupabaseClient<Database>) {
  const result = await database
    .from("payment_plans")
    .select("*")
    .eq("is_default", true)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data
    ? {
        finalDueDaysBeforeEvent: String(result.data.final_due_days_before_event),
        finalDueRule: result.data.final_due_rule as PaymentPlanRecord["finalDueRule"],
        finalPaymentPercent: Number(result.data.final_payment_percent).toFixed(2),
        retainerGracePeriodDays: String(result.data.retainer_grace_period_days),
        retainerPercent: Number(result.data.retainer_percent).toFixed(2),
      }
    : null;
}

function buildPlannedInvoices(props: {
  contractId: string;
  displayCurrency: string;
  eventDate: string | null;
  eventId: string;
  invoiceType: InvoiceType;
  paymentPlan: PaymentPlanRecord;
  quoteVersionId: string;
  sourceTotals: { subtotalMxn: number; taxTotalMxn: number; totalMxn: number };
}) {
  const retainerPercent = Number(props.paymentPlan.retainerPercent) / 100;
  const finalPercent = Number(props.paymentPlan.finalPaymentPercent) / 100;

  if (finalPercent <= 0 || retainerPercent >= 1) {
    return [buildInvoiceRecord({
      clientVisible: props.invoiceType === "omds_client_invoice",
      contractId: props.contractId,
      displayCurrency: props.displayCurrency,
      dueAt: dueAtFromNow(Number(props.paymentPlan.retainerGracePeriodDays)),
      eventId: props.eventId,
      installmentKey: "single",
      invoiceType: props.invoiceType,
      issuedAt: props.invoiceType === "omds_client_invoice" ? new Date().toISOString() : null,
      quoteVersionId: props.quoteVersionId,
      sourceTotals: props.sourceTotals,
    })];
  }

  const retainerTotal = roundMoney(props.sourceTotals.totalMxn * retainerPercent);
  const finalTotal = roundMoney(props.sourceTotals.totalMxn - retainerTotal);
  const retainerSubtotal = roundMoney(props.sourceTotals.subtotalMxn * retainerPercent);
  const finalSubtotal = roundMoney(props.sourceTotals.subtotalMxn - retainerSubtotal);
  const retainerTax = roundMoney(props.sourceTotals.taxTotalMxn * retainerPercent);
  const finalTax = roundMoney(props.sourceTotals.taxTotalMxn - retainerTax);

  return [
    buildInvoiceRecord({
      clientVisible: props.invoiceType === "omds_client_invoice",
      contractId: props.contractId,
      displayCurrency: props.displayCurrency,
      dueAt: dueAtFromNow(Number(props.paymentPlan.retainerGracePeriodDays)),
      eventId: props.eventId,
      installmentKey: "retainer",
      invoiceType: props.invoiceType,
      issuedAt: props.invoiceType === "omds_client_invoice" ? new Date().toISOString() : null,
      quoteVersionId: props.quoteVersionId,
      sourceTotals: { subtotalMxn: retainerSubtotal, taxTotalMxn: retainerTax, totalMxn: retainerTotal },
    }),
    buildInvoiceRecord({
      clientVisible: props.invoiceType === "omds_client_invoice",
      contractId: props.contractId,
      displayCurrency: props.displayCurrency,
      dueAt:
        props.paymentPlan.finalDueRule === "days_before_event"
          ? dueAtBeforeEvent(props.eventDate, Number(props.paymentPlan.finalDueDaysBeforeEvent))
          : null,
      eventId: props.eventId,
      installmentKey: "balance",
      invoiceType: props.invoiceType,
      issuedAt: props.invoiceType === "omds_client_invoice" ? new Date().toISOString() : null,
      quoteVersionId: props.quoteVersionId,
      sourceTotals: { subtotalMxn: finalSubtotal, taxTotalMxn: finalTax, totalMxn: finalTotal },
    }),
  ];
}

function buildInvoiceRecord(props: {
  clientVisible: boolean;
  contractId: string;
  displayCurrency: string;
  dueAt: string | null;
  eventId: string;
  installmentKey: "balance" | "retainer" | "single";
  invoiceType: InvoiceType;
  issuedAt: string | null;
  quoteVersionId: string;
  sourceTotals: { subtotalMxn: number; taxTotalMxn: number; totalMxn: number };
}) {
  return {
    client_visible: props.clientVisible,
    contract_id: props.contractId,
    display_currency: props.displayCurrency,
    due_at: props.dueAt,
    event_id: props.eventId,
    installment_key: props.installmentKey,
    invoice_type: props.invoiceType,
    issued_at: props.issuedAt,
    quote_version_id: props.quoteVersionId,
    status: props.clientVisible ? "issued" : "draft",
    subtotal_mxn: props.sourceTotals.subtotalMxn,
    tax_total_mxn: props.sourceTotals.taxTotalMxn,
    total_mxn: props.sourceTotals.totalMxn,
  } satisfies Partial<InvoiceRow>;
}

async function replacePlannedInvoiceItems(
  database: SupabaseClient<Database>,
  invoice: InvoiceRow,
  installmentKey: "balance" | "retainer" | "single",
) {
  const isSingleInstallment = installmentKey === "single";
  const deleteResult = await database.from("invoice_items").delete().eq("invoice_id", invoice.id);
  if (deleteResult.error) throw deleteResult.error;

  if (isSingleInstallment && invoice.quote_version_id) {
    const items = await database
      .from("quote_items")
      .select("*")
      .eq("quote_version_id", invoice.quote_version_id)
      .order("sort_order");
    if (items.error) throw items.error;

    const insertResult = items.data.length
      ? await database.from("invoice_items").insert(items.data.map((item) => toInvoiceItem(item, invoice.id)))
      : await database.from("invoice_items").insert({
          description: "Invoice",
          details: "Generated from accepted quote.",
          invoice_id: invoice.id,
          is_taxable: true,
          line_total_mxn: invoice.total_mxn,
          quantity: 1,
          sort_order: 0,
          unit_price_mxn: invoice.total_mxn,
        });

    if (insertResult.error) throw insertResult.error;
    return;
  }

  const insertResult = await database.from("invoice_items").insert({
    description:
      installmentKey === "retainer"
        ? "Retainer Invoice"
        : installmentKey === "balance"
          ? "Balance Invoice"
          : "Invoice",
    details: "Generated from payment plan.",
    invoice_id: invoice.id,
    is_taxable: true,
    line_total_mxn: invoice.total_mxn,
    quantity: 1,
    sort_order: 0,
    unit_price_mxn: invoice.total_mxn,
  });

  if (insertResult.error) throw insertResult.error;
}

function toInvoiceItem(item: QuoteItemRow, invoiceId: string) {
  return {
    description: item.description,
    details: item.details,
    invoice_id: invoiceId,
    is_taxable: item.is_taxable,
    line_total_mxn: item.line_total_mxn,
    quantity: item.quantity,
    sort_order: item.sort_order,
    unit_price_mxn: item.unit_price_mxn,
  };
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function dueAtFromNow(graceDays: number) {
  return new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000).toISOString();
}

function dueAtBeforeEvent(eventDate: string | null, daysBeforeEvent: number) {
  if (!eventDate) return null;
  const date = new Date(eventDate);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() - daysBeforeEvent);
  date.setHours(23, 59, 59, 0);
  return date.toISOString();
}