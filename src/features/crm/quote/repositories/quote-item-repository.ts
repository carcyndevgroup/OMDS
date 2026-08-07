import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  QuoteAddManualItemValues,
  QuoteAddProductValues,
  QuoteMoveDirection,
  QuoteUpdateItemValues,
} from "../types/quote";
import { calculateQuoteTotals } from "./quote-calculations";

export async function addManualItemToQuoteVersion(
  database: SupabaseClient<Database>,
  versionId: string,
  values: QuoteAddManualItemValues,
) {
  await ensureDraftVersion(database, versionId);

  const existingItems = await database
    .from("quote_items")
    .select("id")
    .eq("quote_version_id", versionId);
  if (existingItems.error) throw existingItems.error;

  const quantity = Number(values.quantity);
  const unitPrice = Number(values.unitPriceMxn);
  const insert = await database.from("quote_items").insert({
    cog_mxn: Number(values.cogMxn),
    description: values.description.trim(),
    details: values.details.trim(),
    is_taxable: values.isTaxable,
    line_total_mxn: quantity * unitPrice,
    product_id: null,
    quantity,
    quote_version_id: versionId,
    sort_order: existingItems.data.length + 1,
    unit_price_mxn: unitPrice,
  });
  if (insert.error) throw insert.error;

  await recalculateQuoteVersion(database, versionId);
}

export async function addProductToQuoteVersion(
  database: SupabaseClient<Database>,
  versionId: string,
  values: QuoteAddProductValues,
) {
  await ensureDraftVersion(database, versionId);

  const [product, existingItems] = await Promise.all([
    database.from("product_catalog").select("*").eq("id", values.productId).single(),
    database.from("quote_items").select("*").eq("quote_version_id", versionId),
  ]);
  if (product.error) throw product.error;
  if (existingItems.error) throw existingItems.error;

  const quantity = Number(values.quantity);
  const lineTotal = quantity * Number(product.data.price_mxn);
  const insert = await database.from("quote_items").insert({
    cog_mxn: product.data.cog_mxn,
    description: product.data.name,
    details: product.data.description,
    is_taxable: product.data.is_taxable,
    line_total_mxn: lineTotal,
    product_id: product.data.id,
    quantity,
    quote_version_id: versionId,
    sort_order: existingItems.data.length + 1,
    unit_price_mxn: product.data.price_mxn,
  });
  if (insert.error) throw insert.error;

  await recalculateQuoteVersion(database, versionId);
}

export async function moveQuoteItem(
  database: SupabaseClient<Database>,
  versionId: string,
  itemId: string,
  direction: QuoteMoveDirection,
) {
  await ensureDraftVersion(database, versionId);

  const items = await database
    .from("quote_items")
    .select("*")
    .eq("quote_version_id", versionId)
    .order("sort_order");
  if (items.error) throw items.error;

  const currentIndex = items.data.findIndex((item) => item.id === itemId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const current = items.data[currentIndex];
  const target = items.data[targetIndex];
  if (!current || !target) return;

  const [currentUpdate, targetUpdate] = await Promise.all([
    database.from("quote_items").update({ sort_order: target.sort_order }).eq("id", current.id),
    database.from("quote_items").update({ sort_order: current.sort_order }).eq("id", target.id),
  ]);
  if (currentUpdate.error) throw currentUpdate.error;
  if (targetUpdate.error) throw targetUpdate.error;
}

export async function removeQuoteItem(
  database: SupabaseClient<Database>,
  versionId: string,
  itemId: string,
) {
  await ensureDraftVersion(database, versionId);

  const result = await database.from("quote_items").delete().eq("id", itemId);
  if (result.error) throw result.error;
  await recalculateQuoteVersion(database, versionId);
}

export async function updateQuoteItem(
  database: SupabaseClient<Database>,
  versionId: string,
  itemId: string,
  values: QuoteUpdateItemValues,
) {
  await ensureDraftVersion(database, versionId);

  const quantity = Number(values.quantity);
  const unitPrice = Number(values.unitPriceMxn);
  const result = await database
    .from("quote_items")
    .update({
      cog_mxn: Number(values.cogMxn),
      description: values.description.trim(),
      details: values.details.trim(),
      is_taxable: values.isTaxable,
      line_total_mxn: quantity * unitPrice,
      quantity,
      unit_price_mxn: unitPrice,
    })
    .eq("id", itemId)
    .eq("quote_version_id", versionId);
  if (result.error) throw result.error;

  await recalculateQuoteVersion(database, versionId);
}

async function ensureDraftVersion(
  database: SupabaseClient<Database>,
  versionId: string,
) {
  const version = await database
    .from("quote_versions")
    .select("status")
    .eq("id", versionId)
    .single();

  if (version.error) throw version.error;
  if (version.data.status !== "draft") throw new Error("quote_version_locked");
}

async function recalculateQuoteVersion(
  database: SupabaseClient<Database>,
  versionId: string,
) {
  const [version, items] = await Promise.all([
    database.from("quote_versions").select("*").eq("id", versionId).single(),
    database.from("quote_items").select("*").eq("quote_version_id", versionId),
  ]);
  if (version.error) throw version.error;
  if (items.error) throw items.error;

  const totals = calculateQuoteTotals(version.data, items.data);
  const update = await database.from("quote_versions").update(totals).eq("id", versionId);
  if (update.error) throw update.error;
}
