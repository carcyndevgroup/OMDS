const SAT_DECIMALS = 6;
const IVA_RETENTION_RATE = 0.106667;
const ISR_RETENTION_RATE = 0.1;

const amount = (value: string) => Number(value || 0);
const satDecimal = (value: number) => value.toFixed(SAT_DECIMALS);

export const zeroSatAmount = () => satDecimal(0);

export function calculateIvaRetention(subtotalMxn: string) {
  return satDecimal(amount(subtotalMxn) * IVA_RETENTION_RATE);
}

export function calculateIsrRetention(subtotalMxn: string) {
  return satDecimal(amount(subtotalMxn) * ISR_RETENTION_RATE);
}

export function hasSatAmount(value: string) {
  return amount(value) > 0;
}
