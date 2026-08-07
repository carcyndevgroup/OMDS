import type { SatFacturaDetail } from "../types/sat-factura";

const hasAmount = (value: string) => Number(value || 0) > 0;

export function accountantRequestForDetail(factura: SatFacturaDetail) {
  const generated = buildDetailRequest(factura);
  return isStaleRequest(factura.accountantRequestText, factura)
    ? generated
    : factura.accountantRequestText;
}

function buildDetailRequest(factura: SatFacturaDetail) {
  const retentionText =
    hasAmount(factura.ivaRetentionMxn) || hasAmount(factura.isrRetentionMxn)
      ? ", CON RETENCIONES"
      : "";

  return [
    `RFC EMISOR: ${factura.fiscalProfileRfc}`,
    `NOMBRE EMISOR: ${factura.fiscalProfileLegalName}`,
    `RFC RECEPTOR: ${factura.rfc}`,
    `NOMBRE RECEPTOR: ${factura.recipientName}`,
    `NOVIOS: ${factura.clientName}`,
    `HOTEL: ${factura.venueName}`,
    `FECHA: ${factura.eventDate}`,
    `SERVICIO: ${factura.serviceDescription}`,
    `PAX: ${factura.pax}`,
    `SUBTOTAL: ${factura.subtotalMxn} + IVA${retentionText}`,
  ].join("\n").toUpperCase();
}

function isStaleRequest(value: string, factura: SatFacturaDetail) {
  const text = value.toUpperCase();

  return !value.trim()
    || (Boolean(factura.rfc) && /RFC RECEPTOR:\s*(\n|$)/.test(text))
    || (Boolean(factura.recipientName) && /NOMBRE RECEPTOR:\s*(\n|$)/.test(text))
    || (Boolean(factura.serviceDescription) && /SERVICIO:\s*(\n|$)/.test(text))
    || (hasAmount(factura.subtotalMxn) && /SUBTOTAL:\s*0(\.0+)?\s*\+ IVA/.test(text));
}
