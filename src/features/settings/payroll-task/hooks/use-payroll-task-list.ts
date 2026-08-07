"use client";

import { useEffect, useState } from "react";

import type { PayrollTask } from "../types/payroll-task";

type PayrollTasksResponse = { data: PayrollTask[] };

export function usePayrollTaskList() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<PayrollTask[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/settings/payroll-tasks", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("payroll_task_load_failed");
        return response.json() as Promise<PayrollTasksResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setTasks(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { hasError, isLoading, tasks };
}
