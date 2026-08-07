"use client";

import { useCallback, useState } from "react";

import type { ProductFormValues } from "../types/product";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useProductMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(async (values: ProductFormValues) => {
    setStatus("loading");
    const response = await fetch(id ? `/api/settings/products/${id}` : "/api/settings/products", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: id ? "PUT" : "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("product_mutation_failed");
    }

    setStatus("success");
  }, [id]);

  return { mutate, status };
}
