export function formatMoneyMxn(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `MXN ${new Intl.NumberFormat("en-US", {
    currency: "MXN",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(safeAmount)}`;
}
