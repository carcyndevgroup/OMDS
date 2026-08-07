import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  SatComplementoAction,
  SatFacturaDetail,
  SatFacturaWorkflowValues,
} from "../types/sat-factura";
import { getSatFacturaDetail } from "./sat-factura-queue-repository";

const nullable = (value: string) => value.trim() || null;

export async function updateSatFacturaWorkflow(
  database: SupabaseClient<Database>,
  facturaId: string,
  values: SatFacturaWorkflowValues,
): Promise<SatFacturaDetail | null> {
  const result = await database
    .from("event_sat_facturas")
    .update({
      accountant_requested_at: nullable(values.accountantRequestedAt),
      complemento_pdf_url: values.complementoPdfUrl.trim(),
      complemento_received_at: nullable(values.complementoReceivedAt),
      complemento_requested_at: nullable(values.complementoRequestedAt),
      complemento_sent_at: nullable(values.complementoSentAt),
      complemento_status: values.complementoStatus,
      complemento_xml_url: values.complementoXmlUrl.trim(),
      factura_number: values.facturaNumber.trim(),
      factura_pdf_url: values.facturaPdfUrl.trim(),
      factura_xml_url: values.facturaXmlUrl.trim(),
      issued_at: nullable(values.issuedAt),
      paid_at: nullable(values.paidAt),
      sent_to_venue_at: nullable(values.sentToVenueAt),
      status: values.status,
      uuid_fiscal: values.uuidFiscal.trim(),
    })
    .eq("id", facturaId)
    .select("id")
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) return null;

  return getSatFacturaDetail(database, facturaId);
}

export async function updateSatFacturaComplemento(
  database: SupabaseClient<Database>,
  facturaId: string,
  action: SatComplementoAction,
): Promise<SatFacturaDetail | null> {
  const timestamp = new Date().toISOString();
  const payload = complementoPayload(action, timestamp);
  const result = await database
    .from("event_sat_facturas")
    .update(payload)
    .eq("id", facturaId)
    .select("id")
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) return null;

  return getSatFacturaDetail(database, facturaId);
}

function complementoPayload(action: SatComplementoAction, timestamp: string) {
  if (action === "requested") {
    return {
      complemento_requested_at: timestamp,
      complemento_status: "requested",
    };
  }

  if (action === "received") {
    return {
      complemento_received_at: timestamp,
      complemento_status: "received",
    };
  }

  return {
    complemento_sent_at: timestamp,
    complemento_status: "sent",
  };
}
