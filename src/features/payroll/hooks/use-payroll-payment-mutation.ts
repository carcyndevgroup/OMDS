"use client";

import { useCallback, useState } from "react";

import type { PayrollPaymentFormValues } from "../types/payroll";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function usePayrollPaymentMutation() {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const recordPayment = useCallback(async (
    lineItemIds: string[],
    values: PayrollPaymentFormValues,
  ) => {
    setStatus("loading");
    const response = await fetch("/api/payroll/payments", {
      body: JSON.stringify({ lineItemIds, values }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("payroll_payment_record_failed");
    }

    setStatus("success");
  }, []);

  return { recordPayment, status };
}
