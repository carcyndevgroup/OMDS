"use client";

import { useCallback, useState } from "react";

import type { PayrollTaskFormValues } from "../types/payroll-task";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function usePayrollTaskMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(async (values: PayrollTaskFormValues) => {
    setStatus("loading");
    const response = await fetch(id ? `/api/settings/payroll-tasks/${id}` : "/api/settings/payroll-tasks", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: id ? "PUT" : "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("payroll_task_mutation_failed");
    }

    setStatus("success");
  }, [id]);

  return { mutate, status };
}
