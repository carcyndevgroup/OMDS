"use client";

import { useCallback, useEffect, useState } from "react";

import type { SatPaymentDetail } from "../types/sat-factura";

type SatPaymentResponse = { data: SatPaymentDetail };

export function useSatPayment(paymentId: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [payment, setPayment] = useState<SatPaymentDetail | null>(null);

  const load = useCallback((signal?: AbortSignal) => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/sat-facturas/payments/${paymentId}`, { signal: signal ?? controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("sat_payment_load_failed");
        return response.json() as Promise<SatPaymentResponse>;
      })
      .then((result) => {
        if (!(signal ?? controller.signal).aborted) setPayment(result.data);
      })
      .catch(() => {
        if (!(signal ?? controller.signal).aborted) setHasError(true);
      })
      .finally(() => {
        if (!(signal ?? controller.signal).aborted) setIsLoading(false);
      });

    return controller;
  }, [paymentId]);

  useEffect(() => {
    const controller = load();
    return () => controller.abort();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { hasError, isLoading, payment, refresh };
}
