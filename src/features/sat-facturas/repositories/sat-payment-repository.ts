import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  SatFacturaStatus,
  SatPaymentAllocationItem,
  SatPaymentDetail,
  SatPaymentFormValues,
  SatPaymentQueueItem,
} from "../types/sat-factura";

type PaymentRow = Database["public"]["Tables"]["sat_payments"]["Row"];
type AllocationRow = Database["public"]["Tables"]["sat_payment_facturas"]["Row"];
type FacturaRow = Database["public"]["Tables"]["event_sat_facturas"]["Row"];
type EventRow = Pick<Database["public"]["Tables"]["events"]["Row"], "event_date" | "id" | "venue_name">;
type ClientRow = Pick<Database["public"]["Tables"]["clients"]["Row"], "first_name" | "id" | "last_name">;

const fullName = (client?: ClientRow) => client ? `${client.first_name} ${client.last_name}`.trim() : "";

export async function createSatPayment(
  database: SupabaseClient<Database>,
  values: SatPaymentFormValues,
) {
  const result = await database.rpc("create_sat_payment_with_allocations", {
    input: {
      allocations: values.allocations,
      amountMxn: values.amountMxn,
      bankAccountId: values.bankAccountId,
      notes: values.notes,
      paymentDate: values.paymentDate,
      proofFileUrl: values.proofFileUrl,
      reference: values.reference,
      venueId: values.venueId,
    },
  });

  if (result.error) throw result.error;
  return result.data;
}

export async function listSatPayments(
  database: SupabaseClient<Database>,
): Promise<SatPaymentQueueItem[]> {
  const payments = await database.from("sat_payments").select("*").order("payment_date", { ascending: false });
  if (payments.error) throw payments.error;
  if (!payments.data.length) return [];

  const [allocations, venues, accounts] = await Promise.all([
    database.from("sat_payment_facturas").select("*").in("payment_id", payments.data.map((payment) => payment.id)),
    database.from("venues").select("id, name").in("id", compact(payments.data.map((payment) => payment.venue_id))),
    database.from("sat_bank_accounts").select("id, nickname").in("id", compact(payments.data.map((payment) => payment.bank_account_id))),
  ]);

  if (allocations.error) throw allocations.error;
  if (venues.error) throw venues.error;
  if (accounts.error) throw accounts.error;

  const venueNames = new Map(venues.data.map((venue) => [venue.id, venue.name]));
  const accountNames = new Map(accounts.data.map((account) => [account.id, account.nickname]));

  return payments.data.map((payment) => ({
    allocationCount: allocations.data.filter((item) => item.payment_id === payment.id).length,
    amountMxn: String(payment.amount_mxn),
    bankAccountName: payment.bank_account_id ? accountNames.get(payment.bank_account_id) ?? "" : "",
    id: payment.id,
    paymentDate: payment.payment_date,
    proofFileUrl: payment.proof_file_url,
    reference: payment.reference,
    venueName: payment.venue_id ? venueNames.get(payment.venue_id) ?? "" : "",
  }));
}

export async function getSatPaymentDetail(
  database: SupabaseClient<Database>,
  paymentId: string,
): Promise<SatPaymentDetail | null> {
  const payment = await database.from("sat_payments").select("*").eq("id", paymentId).maybeSingle();
  if (payment.error) throw payment.error;
  if (!payment.data) return null;

  const allocationResult = await database.from("sat_payment_facturas").select("*").eq("payment_id", paymentId);
  if (allocationResult.error) throw allocationResult.error;

  const allocations = await hydrateAllocations(database, allocationResult.data);
  const [venue, account] = await Promise.all([
    payment.data.venue_id ? database.from("venues").select("name").eq("id", payment.data.venue_id).maybeSingle() : null,
    payment.data.bank_account_id ? database.from("sat_bank_accounts").select("nickname").eq("id", payment.data.bank_account_id).maybeSingle() : null,
  ]);

  if (venue?.error) throw venue.error;
  if (account?.error) throw account.error;

  return {
    allocationCount: allocations.length,
    allocations,
    amountMxn: String(payment.data.amount_mxn),
    bankAccountName: account?.data?.nickname ?? "",
    id: payment.data.id,
    notes: payment.data.notes,
    paymentDate: payment.data.payment_date,
    proofFileUrl: payment.data.proof_file_url,
    reference: payment.data.reference,
    venueName: venue?.data?.name ?? "",
  };
}

async function hydrateAllocations(
  database: SupabaseClient<Database>,
  allocations: AllocationRow[],
): Promise<SatPaymentAllocationItem[]> {
  if (!allocations.length) return [];

  const facturas = await database.from("event_sat_facturas").select("*").in("id", allocations.map((item) => item.factura_id));
  if (facturas.error) throw facturas.error;

  const eventIds = compact(facturas.data.map((factura) => factura.event_id));
  const [events, contacts] = await Promise.all([
    database.from("events").select("id, event_date, venue_name").in("id", eventIds),
    database.from("event_contacts").select("*").in("event_id", eventIds),
  ]);
  if (events.error) throw events.error;
  if (contacts.error) throw contacts.error;

  const clientIds = compact(contacts.data.map((contact) => contact.client_id));
  const clients = clientIds.length
    ? await database.from("clients").select("id, first_name, last_name").in("id", clientIds)
    : { data: [] as ClientRow[], error: null };
  if (clients.error) throw clients.error;

  return allocations.map((allocation) =>
    mapAllocation(allocation, facturas.data, events.data, contacts.data, clients.data),
  );
}

function mapAllocation(
  allocation: AllocationRow,
  facturas: FacturaRow[],
  events: EventRow[],
  contacts: Database["public"]["Tables"]["event_contacts"]["Row"][],
  clients: ClientRow[],
): SatPaymentAllocationItem {
  const factura = facturas.find((item) => item.id === allocation.factura_id);
  const event = events.find((item) => item.id === factura?.event_id);
  const contact = contacts.find((item) => item.event_id === factura?.event_id && item.is_primary)
    ?? contacts.find((item) => item.event_id === factura?.event_id);
  const client = clients.find((item) => item.id === contact?.client_id);

  return {
    amountAppliedMxn: String(allocation.amount_applied_mxn),
    clientName: fullName(client),
    complementoStatus: factura?.complemento_status ?? "not_required",
    facturaId: allocation.factura_id,
    facturaNumber: factura?.factura_number ?? "",
    status: (factura?.status ?? "pending") as SatFacturaStatus,
    totalMxn: String(factura?.total_mxn ?? 0),
    venueName: event?.venue_name ?? "",
  };
}

function compact(values: (string | null)[]) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}
