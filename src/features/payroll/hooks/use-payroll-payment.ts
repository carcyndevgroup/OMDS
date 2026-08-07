"use client";

import { useCallback, useEffect, useState } from "react";

import type { PayrollPaymentDetail } from "../types/payroll";

type PaymentState = {
  hasError: boolean;
  isLoading: boolean;
  payment: PayrollPaymentDetail | null;
};

export function usePayrollPayment(paymentId: string) {
  const [state, setState] = useState<PaymentState>({
    hasError: false,
    isLoading: true,
    payment: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, hasError: false, isLoading: true }));

    try {
      const response = await fetch(`/api/payroll/payments/${paymentId}`);
      if (!response.ok) throw new Error("payroll_payment_load_failed");
      const payload = (await response.json()) as { data: PayrollPaymentDetail };
      setState({ hasError: false, isLoading: false, payment: payload.data });
    } catch {
      setState({ hasError: true, isLoading: false, payment: null });
    }
  }, [paymentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
