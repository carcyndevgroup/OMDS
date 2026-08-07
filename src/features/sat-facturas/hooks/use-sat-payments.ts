"use client";

import { useEffect, useState } from "react";

import type { SatPaymentQueueItem } from "../types/sat-factura";

type SatPaymentsResponse = { data: SatPaymentQueueItem[] };

export function useSatPayments() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<SatPaymentQueueItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/sat-facturas/payments", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("sat_payments_load_failed");
        return response.json() as Promise<SatPaymentsResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setPayments(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { hasError, isLoading, payments };
}
