"use client";

import { useEffect, useState } from "react";

import type { SatFacturaQueueItem } from "../types/sat-factura";

type SatFacturasResponse = { data: SatFacturaQueueItem[] };

export function useSatFacturas() {
  const [facturas, setFacturas] = useState<SatFacturaQueueItem[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/sat-facturas", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("sat_facturas_load_failed");
        return response.json() as Promise<SatFacturasResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setFacturas(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { facturas, hasError, isLoading };
}
