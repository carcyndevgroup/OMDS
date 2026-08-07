"use client";

import { useCallback, useState } from "react";

type MutationStatus = "idle" | "loading" | "success" | "error";

type CreateBatchInput = {
  lineItemIds: string[];
  notes?: string;
  scheduledPayDate: string;
};

export function usePayrollBatchMutation() {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const createBatch = useCallback(async (input: CreateBatchInput) => {
    setStatus("loading");
    const response = await fetch("/api/payroll/batches", {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("payroll_batch_create_failed");
    }

    setStatus("success");
  }, []);

  return { createBatch, status };
}
