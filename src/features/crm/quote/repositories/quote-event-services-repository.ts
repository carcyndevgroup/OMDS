import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { eventServiceProductNames } from "../constants/event-service-product-map";
import { calculateQuoteTotals } from "./quote-calculations";

type ProductRow = Database["public"]["Tables"]["product_catalog"]["Row"];

export async function applyEventServicesToQuoteVersion(
  database: SupabaseClient<Database>,
  eventId: string,
  versionId: string,
) {
  await ensureDraftVersion(database, versionId);

  const [event, services, products, existingItems] = await Promise.all([
    database.from("events").select("guest_count").eq("id", eventId).single(),
    database.from("event_services").select("service_id").eq("event_id", eventId),
    database.from("product_catalog").select("*").eq("is_active", true),
    database.from("quote_items").select("product_id, sort_order").eq("quote_version_id", versionId),
  ]);

  if (event.error) throw event.error;
  if (services.error) throw services.error;
  if (products.error) throw products.error;
  if (existingItems.error) throw existingItems.error;

  const quantity = Math.max(Number(event.data.guest_count), 1);
  const existingProductIds = new Set(existingItems.data.map((item) => item.product_id));
  const productsByName = new Map(products.data.map((product) => [product.name, product]));
  const startOrder = Math.max(0, ...existingItems.data.map((item) => item.sort_order));

  const inserts = services.data
    .map((service) => productsByName.get(getProductName(service.service_id)))
    .filter((product): product is ProductRow => Boolean(product))
    .filter((product) => !existingProductIds.has(product.id))
    .map((product, index) => ({
      cog_mxn: product.cog_mxn,
      description: product.name,
      details: product.description,
      is_taxable: product.is_taxable,
      line_total_mxn: quantity * Number(product.price_mxn),
      product_id: product.id,
      quantity,
      quote_version_id: versionId,
      sort_order: startOrder + index + 1,
      unit_price_mxn: product.price_mxn,
    }));

  if (!inserts.length) return { addedCount: 0 };

  const insert = await database.from("quote_items").insert(inserts);
  if (insert.error) throw insert.error;

  await recalculateQuoteVersion(database, versionId);
  return { addedCount: inserts.length };
}

function getProductName(serviceId: string) {
  return eventServiceProductNames[serviceId as keyof typeof eventServiceProductNames] ?? "";
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
