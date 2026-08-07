import type { Database } from "@/core/supabase/database.types";

import type {
  SatFacturaDetail,
  SatFacturaQueueItem,
  SatFacturaRecipientType,
  SatFacturaStatus,
} from "../types/sat-factura";

export type SatFacturaClientRow = Pick<
  Database["public"]["Tables"]["clients"]["Row"],
  "first_name" | "id" | "last_name"
>;

export type SatFacturaEventRow = Pick<
  Database["public"]["Tables"]["events"]["Row"],
  "event_date" | "id" | "venue_name"
>;

export type SatFacturaFiscalProfileRow = Pick<
  Database["public"]["Tables"]["sat_fiscal_profiles"]["Row"],
  "legal_name" | "rfc"
>;

export type SatFacturaRow = Database["public"]["Tables"]["event_sat_facturas"]["Row"];

const fullName = (client?: SatFacturaClientRow) => {
  return client ? `${client.first_name} ${client.last_name}`.trim() : "";
};

export function mapFactura(
  factura: SatFacturaRow,
  event?: SatFacturaEventRow,
  client?: SatFacturaClientRow,
): SatFacturaQueueItem {
  return {
    clientId: client?.id ?? "",
    clientName: fullName(client),
    dueAt: factura.due_at,
    eventDate: event?.event_date ?? "",
    eventId: factura.event_id,
    facturaNumber: factura.factura_number,
    id: factura.id,
    recipientName: factura.recipient_name,
    recipientType: factura.recipient_type as SatFacturaRecipientType,
    rfc: factura.rfc,
    status: factura.status as SatFacturaStatus,
    totalMxn: String(factura.total_mxn),
    venueId: factura.payment_partner_venue_id ?? factura.venue_id,
    venueName: event?.venue_name ?? "",
  };
}

export function mapFacturaDetail(
  factura: SatFacturaRow,
  event?: SatFacturaEventRow,
  client?: SatFacturaClientRow,
  fiscalProfile?: SatFacturaFiscalProfileRow,
): SatFacturaDetail {
  return {
    ...mapFactura(factura, event, client),
    accountantRequestedAt: factura.accountant_requested_at,
    accountantRequestText: factura.accountant_request_text,
    bankAccountId: factura.bank_account_id,
    cfdiUse: factura.cfdi_use,
    commissionMxn: String(factura.commission_mxn),
    complementoPdfUrl: factura.complemento_pdf_url,
    complementoReceivedAt: factura.complemento_received_at,
    complementoRequestedAt: factura.complemento_requested_at,
    complementoSentAt: factura.complemento_sent_at,
    complementoStatus: factura.complemento_status,
    complementoXmlUrl: factura.complemento_xml_url,
    creationSource: factura.creation_source,
    currency: factura.currency,
    exchangeRateSource: factura.exchange_rate_source,
    exchangeRateToMxn: String(factura.exchange_rate_to_mxn),
    facturaPdfUrl: factura.factura_pdf_url,
    facturaXmlUrl: factura.factura_xml_url,
    fiscalProfileId: factura.fiscal_profile_id,
    fiscalProfileLegalName: fiscalProfile?.legal_name ?? "",
    fiscalProfileRfc: fiscalProfile?.rfc ?? "",
    issuedAt: factura.issued_at,
    ivaMxn: String(factura.iva_mxn),
    ivaRetentionMxn: String(factura.iva_retention_mxn),
    isrRetentionMxn: String(factura.isr_retention_mxn),
    notes: factura.notes,
    paidAt: factura.paid_at,
    pax: factura.pax ? String(factura.pax) : "",
    paymentForm: factura.payment_form,
    paymentMethod: factura.payment_method,
    sentToVenueAt: factura.sent_to_venue_at,
    serviceDescription: factura.service_description,
    sourceTotalMxn: String(factura.source_total_mxn),
    subtotalMxn: String(factura.subtotal_mxn),
    taxObject: factura.tax_object,
    taxRegime: factura.tax_regime,
    taxTotalMxn: String(factura.tax_total_mxn),
    unitValueMxn: String(factura.unit_value_mxn),
    uuidFiscal: factura.uuid_fiscal,
  };
}
