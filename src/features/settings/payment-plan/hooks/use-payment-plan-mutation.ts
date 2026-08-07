"use client";

import { useCallback, useState } from "react";

import type { PaymentPlanFormValues } from "../types/payment-plan";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function usePaymentPlanMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: PaymentPlanFormValues) => {
      setStatus("loading");
      const response = await fetch(
        id ? `/api/settings/payment-plans/${id}` : "/api/settings/payment-plans",
        {
          body: JSON.stringify(values),
          headers: { "Content-Type": "application/json" },
          method: id ? "PUT" : "POST",
        },
      );

      if (!response.ok) {
        setStatus("error");
        throw new Error("payment_plan_mutation_failed");
      }

      setStatus("success");
    },
    [id],
  );

  return { mutate, status };
}
