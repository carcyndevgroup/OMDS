import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  ProductCategory,
  ProductFormValues,
  ProductItem,
} from "../types/product";

type ProductRow = Database["public"]["Tables"]["product_catalog"]["Row"];

const money = (value: number) => value.toFixed(2);

const toProduct = (row: ProductRow): ProductItem => ({
  category: row.category as ProductCategory,
  cogMxn: money(Number(row.cog_mxn)),
  createdAt: row.created_at,
  description: row.description,
  family: row.family,
  id: row.id,
  isActive: row.is_active,
  isTaxable: row.is_taxable,
  name: row.name,
  notes: row.notes,
  priceMxn: money(Number(row.price_mxn)),
  updatedAt: row.updated_at,
});

const amount = (value: string) => Number(value || 0);

const toPayload = (values: ProductFormValues) => ({
  category: values.category,
  cog_mxn: amount(values.cogMxn),
  description: values.description.trim(),
  family: values.family.trim(),
  is_active: values.isActive,
  is_taxable: values.isTaxable,
  name: values.name.trim(),
  notes: values.notes.trim(),
  price_mxn: amount(values.priceMxn),
});

export async function createProduct(
  database: SupabaseClient<Database>,
  values: ProductFormValues,
) {
  const result = await database.from("product_catalog").insert(toPayload(values)).select("*").single();
  if (result.error) throw result.error;
  return toProduct(result.data);
}

export async function findProduct(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("product_catalog").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toProduct(result.data) : null;
}

export async function listProducts(database: SupabaseClient<Database>) {
  const result = await database.from("product_catalog").select("*").order("category").order("family").order("name");
  if (result.error) throw result.error;
  return result.data.map(toProduct);
}

export async function updateProduct(
  database: SupabaseClient<Database>,
  id: string,
  values: ProductFormValues,
) {
  const result = await database.from("product_catalog").update(toPayload(values)).eq("id", id).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toProduct(result.data) : null;
}
