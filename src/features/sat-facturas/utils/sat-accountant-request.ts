import type { EventListItem } from "@/features/crm/event/types/event";

import type { SatFiscalProfile } from "../types/sat-settings";
import type { SatFacturaFormValues } from "../types/sat-factura";

const blank = "";

const hasAmount = (value: string) => Number(value || 0) > 0;

export function buildSatAccountantRequest(
  values: SatFacturaFormValues,
  event: EventListItem | undefined,
  fiscalProfile: SatFiscalProfile | undefined,
) {
  const retentionText =
    hasAmount(values.ivaRetentionMxn) || hasAmount(values.isrRetentionMxn)
      ? ", CON RETENCIONES"
      : "";

  return [
    `RFC EMISOR: ${fiscalProfile?.rfc ?? blank}`,
    `NOMBRE EMISOR: ${fiscalProfile?.legalName ?? blank}`,
    `RFC RECEPTOR: ${values.rfc}`,
    `NOMBRE RECEPTOR: ${values.recipientName}`,
    `NOVIOS: ${event?.clientName ?? blank}`,
    `HOTEL: ${event?.venueName ?? blank}`,
    `FECHA: ${event?.eventDate ?? blank}`,
    `SERVICIO: ${values.serviceDescription}`,
    `PAX: ${values.pax}`,
    `SUBTOTAL: ${values.subtotalMxn} + IVA${retentionText}`,
  ].join("\n").toUpperCase();
}
