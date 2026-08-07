import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  PayrollPaymentDetail,
  PayrollPaymentDetailLine,
  PayrollPaymentHistoryItem,
} from "../types/payroll";
import { money } from "./payroll-dashboard-calculations";

type PaymentRow = Database["public"]["Tables"]["payroll_payments"]["Row"];
type PaymentItemRow = Database["public"]["Tables"]["payroll_payment_items"]["Row"];
type PayrollRow = Database["public"]["Tables"]["event_payroll_line_items"]["Row"];
type StaffRow = Pick<Database["public"]["Tables"]["staff_members"]["Row"], "display_name" | "id" | "name">;
type EventRow = Pick<Database["public"]["Tables"]["events"]["Row"], "event_date" | "id" | "venue_name">;
type ContactRow = Database["public"]["Tables"]["event_contacts"]["Row"];
type ClientRow = Pick<Database["public"]["Tables"]["clients"]["Row"], "first_name" | "id" | "last_name">;

type PaymentContext = {
  clients: Map<string, ClientRow>;
  contactsByEvent: Map<string, ContactRow>;
  events: Map<string, EventRow>;
  lineItems: PayrollRow[];
  paymentItems: PaymentItemRow[];
  staff: Map<string, StaffRow>;
};

async function getPaymentContext(
  database: SupabaseClient<Database>,
  paymentIds: string[],
): Promise<PaymentContext> {
  const paymentItems = await database
    .from("payroll_payment_items")
    .select("*")
    .in("payment_id", paymentIds);
  if (paymentItems.error) throw paymentItems.error;

  const lineIds = (paymentItems.data as PaymentItemRow[]).map((row) => row.line_item_id);
  const lineItems = lineIds.length
    ? await database.from("event_payroll_line_items").select("*").in("id", lineIds)
    : { data: [], error: null };
  if (lineItems.error) throw lineItems.error;

  const rows = lineItems.data as PayrollRow[];
  const staffIds = Array.from(new Set(rows.map((row) => row.staff_member_id)));
  const eventIds = Array.from(new Set(rows.map((row) => row.event_id)));
  const staff = staffIds.length
    ? await database.from("staff_members").select("id, display_name, name").in("id", staffIds)
    : { data: [], error: null };
  if (staff.error) throw staff.error;

  const events = eventIds.length
    ? await database.from("events").select("id, event_date, venue_name").in("id", eventIds)
    : { data: [], error: null };
  if (events.error) throw events.error;

  const contacts = eventIds.length
    ? await database.from("event_contacts").select("*").in("event_id", eventIds).eq("is_primary", true)
    : { data: [], error: null };
  if (contacts.error) throw contacts.error;

  const clientIds = Array.from(new Set((contacts.data as ContactRow[]).map((row) => row.client_id)));
  const clients = clientIds.length
    ? await database.from("clients").select("id, first_name, last_name").in("id", clientIds)
    : { data: [], error: null };
  if (clients.error) throw clients.error;

  return {
    clients: new Map((clients.data as ClientRow[]).map((row) => [row.id, row])),
    contactsByEvent: new Map((contacts.data as ContactRow[]).map((row) => [row.event_id, row])),
    events: new Map((events.data as EventRow[]).map((row) => [row.id, row])),
    lineItems: rows,
    paymentItems: paymentItems.data as PaymentItemRow[],
    staff: new Map((staff.data as StaffRow[]).map((row) => [row.id, row])),
  };
}

function lineToDetail(row: PayrollRow, context: PaymentContext): PayrollPaymentDetailLine {
  const staff = context.staff.get(row.staff_member_id);
  const event = context.events.get(row.event_id);
  const contact = context.contactsByEvent.get(row.event_id);
  const client = contact ? context.clients.get(contact.client_id) : undefined;

  return {
    amountMxn: money(Number(row.total_mxn)),
    clientName: client ? `${client.first_name} ${client.last_name}`.trim() : "",
    eventDate: event?.event_date ?? "",
    eventId: row.event_id,
    id: row.id,
    staffName: staff?.display_name || staff?.name || "",
    taskName: row.task_name,
    venueName: event?.venue_name ?? "",
  };
}

function paymentToHistory(payment: PaymentRow, context: PaymentContext): PayrollPaymentHistoryItem {
  const lineIds = context.paymentItems
    .filter((row) => row.payment_id === payment.id)
    .map((row) => row.line_item_id);
  const lines = context.lineItems.filter((row) => lineIds.includes(row.id));
  const staffNames = Array.from(
    new Set(lines.map((row) => {
      const staff = context.staff.get(row.staff_member_id);
      return staff?.display_name || staff?.name || "";
    }).filter(Boolean)),
  );

  return {
    bonusMxn: money(Number(payment.bonus_mxn)),
    cashCurrency: payment.cash_currency ?? "",
    id: payment.id,
    lineItemCount: lines.length,
    paidAt: payment.paid_at,
    paymentMethod: payment.payment_method as PayrollPaymentHistoryItem["paymentMethod"],
    receiptFileUrl: payment.receipt_file_url,
    staffNames,
    totalMxn: money(Number(payment.total_mxn)),
    transactionId: payment.transaction_id,
  };
}

export async function listPayrollPaymentHistory(
  database: SupabaseClient<Database>,
): Promise<PayrollPaymentHistoryItem[]> {
  const payments = await database.from("payroll_payments").select("*").order("paid_at", { ascending: false }).limit(25);
  if (payments.error) throw payments.error;
  if (!payments.data.length) return [];

  const context = await getPaymentContext(database, payments.data.map((row) => row.id));
  return (payments.data as PaymentRow[]).map((payment) => paymentToHistory(payment, context));
}

export async function getPayrollPaymentDetail(
  database: SupabaseClient<Database>,
  paymentId: string,
): Promise<PayrollPaymentDetail | null> {
  const payment = await database.from("payroll_payments").select("*").eq("id", paymentId).maybeSingle();
  if (payment.error) throw payment.error;
  if (!payment.data) return null;

  const context = await getPaymentContext(database, [paymentId]);
  const lineIds = context.paymentItems.map((row) => row.line_item_id);
  const lineItems = context.lineItems.filter((row) => lineIds.includes(row.id));

  return {
    ...paymentToHistory(payment.data as PaymentRow, context),
    lineItems: lineItems.map((row) => lineToDetail(row, context)),
    notes: payment.data.notes,
    receivingAccount: payment.data.receiving_account,
    sendingAccount: payment.data.sending_account,
  };
}
