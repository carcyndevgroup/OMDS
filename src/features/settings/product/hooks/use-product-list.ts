"use client";

import { useEffect, useState } from "react";

import type { ProductItem } from "../types/product";

export function useProductList() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);

    void fetch("/api/settings/products", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("product_list_failed");
        const payload = (await response.json()) as { data: ProductItem[] };
        setProducts(payload.data);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setHasError(true);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { hasError, isLoading, products };
}
