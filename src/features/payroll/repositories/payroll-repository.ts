import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  PayrollDashboard,
  PayrollEventDetail,
  PayrollPaymentFormValues,
  PayrollStatus,
} from "../types/payroll";
import {
  buildPayrollSummary,
  emptySummary,
  groupPayrollItems,
  money,
} from "./payroll-dashboard-calculations";

type PayrollRow = Database["public"]["Tables"]["event_payroll_line_items"]["Row"];
type StaffRow = Pick<
  Database["public"]["Tables"]["staff_members"]["Row"],
  "bank_account_number" | "bank_card_number" | "bank_clabe" | "bank_name" | "display_name" | "id" | "name"
>;
type EventRow = Pick<Database["public"]["Tables"]["events"]["Row"], "event_date" | "id" | "venue_name">;
type ContactRow = Database["public"]["Tables"]["event_contacts"]["Row"];
type ClientRow = Pick<Database["public"]["Tables"]["clients"]["Row"], "first_name" | "id" | "last_name">;

export async function listPayrollDashboard(
  database: SupabaseClient<Database>,
): Promise<PayrollDashboard> {
  const payroll = await database
    .from("event_payroll_line_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (payroll.error) throw payroll.error;
  if (!payroll.data.length) return { groups: [], items: [], summary: emptySummary };

  const staffIds = Array.from(new Set(payroll.data.map((row) => row.staff_member_id)));
  const staffResult = staffIds.length
    ? await database
        .from("staff_members")
        .select("id, display_name, name, bank_name, bank_card_number, bank_clabe, bank_account_number")
        .in("id", staffIds)
    : { data: [], error: null };

  if (staffResult.error) throw staffResult.error;

  const staff = new Map((staffResult.data as StaffRow[]).map((row) => [row.id, row]));
  const eventIds = Array.from(new Set(payroll.data.map((row) => row.event_id)));
  const eventsResult = await database
    .from("events")
    .select("id, event_date, venue_name")
    .in("id", eventIds);

  if (eventsResult.error) throw eventsResult.error;

  const events = new Map((eventsResult.data as EventRow[]).map((row) => [row.id, row]));

  const contacts = await database
    .from("event_contacts")
    .select("*")
    .in("event_id", Array.from(events.keys()))
    .eq("is_primary", true);

  if (contacts.error) throw contacts.error;

  const clientIds = Array.from(new Set((contacts.data as ContactRow[]).map((row) => row.client_id)));
  const clientsResult = clientIds.length
    ? await database.from("clients").select("id, first_name, last_name").in("id", clientIds)
    : { data: [], error: null };

  if (clientsResult.error) throw clientsResult.error;

  const clients = new Map((clientsResult.data as ClientRow[]).map((row) => [row.id, row]));
  const contactsByEvent = new Map((contacts.data as ContactRow[]).map((row) => [row.event_id, row]));

  const items = payroll.data.map((row) => {
    const member = staff.get(row.staff_member_id);
    const event = events.get(row.event_id);
    const contact = contactsByEvent.get(row.event_id);
    const client = contact ? clients.get(contact.client_id) : undefined;

    return {
      amountMxn: money(Number(row.total_mxn)),
      clientName: client ? `${client.first_name} ${client.last_name}`.trim() : "",
      eventDate: event?.event_date ?? "",
      eventId: row.event_id,
      id: row.id,
      notes: row.notes,
      receivingAccountDefault: member
        ? [member.bank_name, member.bank_clabe || member.bank_account_number || member.bank_card_number]
            .filter(Boolean)
            .join(" · ")
        : "",
      scheduledPayDate: row.scheduled_pay_date ?? "",
      staffName: member?.display_name || member?.name || "",
      staffMemberId: row.staff_member_id,
      status: row.status as PayrollStatus,
      taskName: row.task_name,
      venueName: event?.venue_name ?? "",
    };
  });

  return {
    groups: groupPayrollItems(items),
    items,
    summary: buildPayrollSummary(payroll.data),
  };
}

export async function getPayrollEventDetail(
  database: SupabaseClient<Database>,
  eventId: string,
): Promise<PayrollEventDetail | null> {
  const dashboard = await listPayrollDashboard(database);
  const lineItems = dashboard.items.filter((item) => item.eventId === eventId);
  if (!lineItems.length) return null;

  const total = lineItems.reduce((sum, item) => sum + Number(item.amountMxn), 0);
  const paid = lineItems
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amountMxn), 0);

  return {
    clientName: lineItems[0].clientName,
    eventDate: lineItems[0].eventDate,
    eventId,
    lineItems,
    paidMxn: money(paid),
    pendingMxn: money(total - paid),
    totalMxn: money(total),
    venueName: lineItems[0].venueName,
  };
}

export async function createPayrollPaymentBatch(
  database: SupabaseClient<Database>,
  scheduledPayDate: string,
  lineItemIds: string[],
  notes = "",
) {
  const result = await database.rpc("create_payroll_payment_batch", {
    input_line_item_ids: lineItemIds,
    input_notes: notes,
    input_scheduled_pay_date: scheduledPayDate,
  });

  if (result.error) throw result.error;
  return result.data;
}

export async function recordPayrollPayment(
  database: SupabaseClient<Database>,
  lineItemIds: string[],
  values: PayrollPaymentFormValues,
) {
  const result = await database.rpc("record_payroll_payment", {
    input_line_item_ids: lineItemIds,
    input_payment: {
      bonusMxn: values.bonusMxn || "0",
      cashCurrency: values.paymentMethod === "cash" ? values.cashCurrency : "",
      notes: values.notes,
      paidAt: values.paidAt,
      paymentMethod: values.paymentMethod,
      receiptFileUrl: values.receiptFileUrl,
      receivingAccount: values.receivingAccount,
      sendingAccount: values.sendingAccount,
      transactionId: values.transactionId,
    },
  });

  if (result.error) throw result.error;
  return result.data;
}
