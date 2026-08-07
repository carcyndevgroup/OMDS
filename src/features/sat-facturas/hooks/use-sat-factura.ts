"use client";

import { useEffect, useState } from "react";

import type { SatFacturaDetail } from "../types/sat-factura";

type SatFacturaResponse = { data: SatFacturaDetail };

export function useSatFactura(facturaId: string) {
  const [factura, setFactura] = useState<SatFacturaDetail | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/sat-facturas/${facturaId}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("sat_factura_load_failed");
        return response.json() as Promise<SatFacturaResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setFactura(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [facturaId]);

  return { factura, hasError, isLoading, setFactura };
}
