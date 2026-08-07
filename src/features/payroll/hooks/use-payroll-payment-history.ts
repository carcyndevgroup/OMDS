"use client";

import { useCallback, useEffect, useState } from "react";

import type { PayrollPaymentHistoryItem } from "../types/payroll";

type HistoryState = {
  hasError: boolean;
  isLoading: boolean;
  payments: PayrollPaymentHistoryItem[];
};

export function usePayrollPaymentHistory() {
  const [state, setState] = useState<HistoryState>({
    hasError: false,
    isLoading: true,
    payments: [],
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, hasError: false, isLoading: true }));

    try {
      const response = await fetch("/api/payroll/payments");
      if (!response.ok) throw new Error("payroll_payment_history_failed");
      const payload = (await response.json()) as { data: PayrollPaymentHistoryItem[] };
      setState({ hasError: false, isLoading: false, payments: payload.data });
    } catch {
      setState({ hasError: true, isLoading: false, payments: [] });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
