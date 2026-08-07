import type { Database } from "@/core/supabase/database.types";

type ItemRow = Database["public"]["Tables"]["quote_items"]["Row"];
type VersionRow = Database["public"]["Tables"]["quote_versions"]["Row"];

export function calculateQuoteTotals(version: VersionRow, items: ItemRow[]) {
  const itemsTotal = items.reduce((total, item) => total + Number(item.line_total_mxn), 0);
  const discount = version.discount_type === "percent"
    ? itemsTotal * (Number(version.discount_value_mxn) / 100)
    : Number(version.discount_value_mxn);
  const subtotal = Math.max(itemsTotal - discount, 0);
  const taxableTotal = items
    .filter((item) => item.is_taxable)
    .reduce((total, item) => total + Number(item.line_total_mxn), 0);
  const taxableRatio = itemsTotal > 0 ? taxableTotal / itemsTotal : 0;
  const taxableSubtotal = subtotal * taxableRatio;
  const ivaTax = version.applies_iva_tax
    ? taxableSubtotal * (Number(version.tax_rate_percent) / 100)
    : 0;
  const ivaRetention = version.applies_iva_retention
    ? taxableSubtotal * (Number(version.iva_retention_rate_percent) / 100)
    : 0;
  const isrRetention = version.applies_isr_retention
    ? taxableSubtotal * (Number(version.isr_retention_rate_percent) / 100)
    : 0;

  return {
    isr_retention_mxn: Number(isrRetention.toFixed(2)),
    items_total_mxn: Number(itemsTotal.toFixed(2)),
    iva_retention_mxn: Number(ivaRetention.toFixed(2)),
    iva_tax_mxn: Number(ivaTax.toFixed(2)),
    subtotal_mxn: Number(subtotal.toFixed(2)),
    tax_total_mxn: Number(ivaTax.toFixed(2)),
    total_mxn: Number((subtotal + ivaTax - ivaRetention - isrRetention).toFixed(2)),
  };
}
