import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  SatFacturaDetail,
  SatFacturaFormValues,
  SatFacturaQueueItem,
} from "../types/sat-factura";
import { mapFactura, mapFacturaDetail } from "./sat-factura-mappers";

const amount = (value: string) => Number(value || 0);
const integer = (value: string) => value.trim() ? Number(value) : null;
const nullable = (value: string) => value.trim() || null;

export async function listSatFacturaQueue(
  database: SupabaseClient<Database>,
): Promise<SatFacturaQueueItem[]> {
  const facturas = await database
    .from("event_sat_facturas")
    .select("*")
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (facturas.error) throw facturas.error;
  if (!facturas.data.length) return [];

  const eventIds = facturas.data.map((factura) => factura.event_id);
  const [events, contacts] = await Promise.all([
    database.from("events").select("id, event_date, venue_name").in("id", eventIds),
    database.from("event_contacts").select("*").in("event_id", eventIds),
  ]);

  if (events.error) throw events.error;
  if (contacts.error) throw contacts.error;

  const clientIds = contacts.data.map((contact) => contact.client_id);
  const clients = clientIds.length
    ? await database.from("clients").select("id, first_name, last_name").in("id", clientIds)
    : { data: [], error: null };

  if (clients.error) throw clients.error;

  const clientsById = new Map(clients.data.map((client) => [client.id, client]));
  const eventsById = new Map(events.data.map((event) => [event.id, event]));

  return facturas.data.map((factura) => {
    const event = eventsById.get(factura.event_id);
    const eventContacts = contacts.data.filter((contact) => contact.event_id === factura.event_id);
    const primary = eventContacts.find((contact) => contact.is_primary) ?? eventContacts[0];
    const client = primary ? clientsById.get(primary.client_id) : undefined;

    return mapFactura(factura, event, client);
  });
}

export async function getSatFacturaDetail(
  database: SupabaseClient<Database>,
  facturaId: string,
): Promise<SatFacturaDetail | null> {
  const factura = await database
    .from("event_sat_facturas")
    .select("*")
    .eq("id", facturaId)
    .maybeSingle();

  if (factura.error) throw factura.error;
  if (!factura.data) return null;

  const [event, contacts] = await Promise.all([
    database
      .from("events")
      .select("id, event_date, venue_name")
      .eq("id", factura.data.event_id)
      .maybeSingle(),
    database.from("event_contacts").select("*").eq("event_id", factura.data.event_id),
  ]);

  if (event.error) throw event.error;
  if (contacts.error) throw contacts.error;

  const primary = contacts.data.find((contact) => contact.is_primary) ?? contacts.data[0];
  const client = primary
    ? await database
      .from("clients")
      .select("id, first_name, last_name")
      .eq("id", primary.client_id)
      .maybeSingle()
    : { data: null, error: null };

  if (client.error) throw client.error;

  const profile = factura.data.fiscal_profile_id
    ? await database
      .from("sat_fiscal_profiles")
      .select("legal_name, rfc")
      .eq("id", factura.data.fiscal_profile_id)
      .maybeSingle()
    : { data: null, error: null };

  if (profile.error) throw profile.error;

  return mapFacturaDetail(
    factura.data,
    event.data ?? undefined,
    client.data ?? undefined,
    profile.data ?? undefined,
  );
}

export async function createSatFactura(
  database: SupabaseClient<Database>,
  values: SatFacturaFormValues,
): Promise<SatFacturaDetail> {
  const [event, contacts] = await Promise.all([
    database.from("events").select("id, event_date, venue_id, venue_name, payment_partner_venue_id").eq("id", values.eventId).maybeSingle(),
    database.from("event_contacts").select("*").eq("event_id", values.eventId),
  ]);

  if (event.error) throw event.error;
  if (contacts.error) throw contacts.error;
  if (!event.data) throw new Error("event_not_found");

  const primary = contacts.data.find((contact) => contact.is_primary) ?? contacts.data[0];
  const recipientClientId = values.recipientType === "client" ? primary?.client_id ?? null : null;

  const result = await database
    .from("event_sat_facturas")
    .insert({
      ...toFacturaPayload(values, event.data, recipientClientId),
      creation_source: "manual",
    })
    .select("*")
    .single();

  if (result.error) throw result.error;

  const client = primary
    ? await database
      .from("clients")
      .select("id, first_name, last_name")
      .eq("id", primary.client_id)
      .maybeSingle()
    : { data: null, error: null };

  if (client.error) throw client.error;

  return mapFacturaDetail(result.data, event.data, client.data ?? undefined);
}

export async function updateSatFactura(
  database: SupabaseClient<Database>,
  facturaId: string,
  values: SatFacturaFormValues,
): Promise<SatFacturaDetail> {
  const current = await database
    .from("event_sat_facturas")
    .select("id")
    .eq("id", facturaId)
    .maybeSingle();
  if (current.error) throw current.error;
  if (!current.data) throw new Error("factura_not_found");

  const [event, contacts] = await Promise.all([
    database.from("events").select("id, event_date, venue_id, venue_name, payment_partner_venue_id").eq("id", values.eventId).maybeSingle(),
    database.from("event_contacts").select("*").eq("event_id", values.eventId),
  ]);

  if (event.error) throw event.error;
  if (contacts.error) throw contacts.error;
  if (!event.data) throw new Error("event_not_found");

  const primary = contacts.data.find((contact) => contact.is_primary) ?? contacts.data[0];
  const recipientClientId = values.recipientType === "client" ? primary?.client_id ?? null : null;
  const result = await database
    .from("event_sat_facturas")
    .update(toFacturaPayload(values, event.data, recipientClientId))
    .eq("id", facturaId)
    .select("*")
    .single();

  if (result.error) throw result.error;

  const client = primary
    ? await database
      .from("clients")
      .select("id, first_name, last_name")
      .eq("id", primary.client_id)
      .maybeSingle()
    : { data: null, error: null };

  if (client.error) throw client.error;

  return mapFacturaDetail(result.data, event.data, client.data ?? undefined);
}

function toFacturaPayload(
  values: SatFacturaFormValues,
  event: { payment_partner_venue_id: string | null; venue_id: string | null },
  recipientClientId: string | null,
) {
  return {
    accountant_request_text: values.accountantRequestText.trim(),
    bank_account_id: nullable(values.bankAccountId),
    cfdi_use: values.cfdiUse.trim(),
    due_at: nullable(values.dueAt),
    event_id: values.eventId,
    exchange_rate_source: values.exchangeRateSource.trim(),
    exchange_rate_to_mxn: amount(values.exchangeRateToMxn) || 1,
    fiscal_profile_id: nullable(values.fiscalProfileId),
    iva_mxn: amount(values.ivaMxn),
    iva_retention_mxn: amount(values.ivaRetentionMxn),
    isr_retention_mxn: amount(values.isrRetentionMxn),
    notes: values.notes.trim(),
    pax: integer(values.pax),
    payment_form: values.paymentForm.trim(),
    payment_method: values.paymentMethod.trim(),
    payment_partner_venue_id: event.payment_partner_venue_id,
    recipient_client_id: recipientClientId,
    recipient_name: values.recipientName.trim(),
    recipient_type: values.recipientType,
    rfc: values.rfc.trim().toUpperCase(),
    service_description: values.serviceDescription.trim(),
    source_total_mxn: amount(values.sourceTotalMxn),
    subtotal_mxn: amount(values.subtotalMxn),
    tax_object: values.taxObject.trim(),
    tax_regime: values.taxRegime.trim(),
    tax_total_mxn: amount(values.taxTotalMxn),
    total_mxn: amount(values.totalMxn),
    unit_value_mxn: amount(values.unitValueMxn),
    venue_id: event.venue_id,
  };
}
