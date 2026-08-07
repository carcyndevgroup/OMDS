export function formatSatMxn(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `MXN ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: 2,
  }).format(safeAmount)}`;
}
