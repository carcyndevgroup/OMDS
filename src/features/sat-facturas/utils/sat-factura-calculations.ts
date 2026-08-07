import type { SatFacturaFormValues } from "../types/sat-factura";

const satDecimal = (value: number) => value.toFixed(6);
const numberValue = (value: string) => Number(value || 0);

export function calculateSatFactura(values: SatFacturaFormValues) {
  const subtotal = numberValue(values.subtotalMxn);
  const iva = numberValue(values.ivaMxn);
  const ivaRetention = numberValue(values.ivaRetentionMxn);
  const isrRetention = numberValue(values.isrRetentionMxn);
  const pax = numberValue(values.pax);
  const taxTotal = Math.max(iva - ivaRetention - isrRetention, 0);
  const total = Math.max(subtotal + iva - ivaRetention - isrRetention, 0);

  return {
    taxTotalMxn: satDecimal(taxTotal),
    totalMxn: satDecimal(total),
    unitValueMxn: pax > 0 ? satDecimal(subtotal / pax) : "0.000000",
  };
}
