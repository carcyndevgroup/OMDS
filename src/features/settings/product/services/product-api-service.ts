import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { ProductFormValues } from "../types/product";
import {
  createProduct,
  findProduct,
  listProducts,
  updateProduct,
} from "../repositories/product-repository";

export async function createProductApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: ProductFormValues) => createProduct(client, values),
    find: (id: string) => findProduct(client, id),
    list: () => listProducts(client),
    update: (id: string, values: ProductFormValues) =>
      updateProduct(client, id, values),
  };
}
