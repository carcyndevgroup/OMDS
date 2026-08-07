"use client";

import { useEffect, useState } from "react";

import type { ProductItem } from "../types/product";

export function useProduct(id: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);

    void fetch(`/api/settings/products/${id}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("product_load_failed");
        const payload = (await response.json()) as { data: ProductItem };
        setProduct(payload.data);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setHasError(true);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [id]);

  return { hasError, isLoading, product };
}
