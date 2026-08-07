"use client";

import { useEffect, useState } from "react";

import type { PaymentPlan } from "../types/payment-plan";

export function usePaymentPlan(id: string) {
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/settings/payment-plans/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("payment_plan_load_failed");
        return response.json() as Promise<{ data: PaymentPlan }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setPaymentPlan(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { hasError, isLoading, paymentPlan };
}
