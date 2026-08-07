"use client";

import { useEffect, useState } from "react";

import type { PayrollTask } from "../types/payroll-task";

type PayrollTaskResponse = { data: PayrollTask };

export function usePayrollTask(id: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState<PayrollTask | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/settings/payroll-tasks/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("payroll_task_load_failed");
        return response.json() as Promise<PayrollTaskResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setTask(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { hasError, isLoading, task };
}
