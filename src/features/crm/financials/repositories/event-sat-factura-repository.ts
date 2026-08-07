import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EventSatFactura,
  EventSatFacturaStatus,
} from "../types/event-sat-factura";

type FacturaRow = Database["public"]["Tables"]["event_sat_facturas"]["Row"];

const mapFactura = (row: FacturaRow): EventSatFactura => ({
  facturaNumber: row.factura_number,
  id: row.id,
  issuedAt: row.issued_at,
  notes: row.notes,
  paidAt: row.paid_at,
  recipientName: row.recipient_name,
  rfc: row.rfc,
  status: row.status as EventSatFacturaStatus,
  subtotalMxn: String(row.subtotal_mxn),
  taxTotalMxn: String(row.tax_total_mxn),
  totalMxn: String(row.total_mxn),
});

export async function listEventSatFacturas(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const result = await database
    .from("event_sat_facturas")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (result.error) throw result.error;
  return result.data.map(mapFactura);
}
