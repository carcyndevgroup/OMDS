"use client";

import { useEffect, useState } from "react";

import type { PayrollDashboard } from "../types/payroll";

type PayrollResponse = { data: PayrollDashboard };

const emptyDashboard: PayrollDashboard = {
  groups: [],
  items: [],
  summary: {
    approvedMxn: "0",
    dueThisWednesdayMxn: "0",
    estimatedMxn: "0",
    paidMxn: "0",
    paidThisPeriodMxn: "0",
    totalPendingMxn: "0",
    overdueMxn: "0",
    unpaidMxn: "0",
    waivedMxn: "0",
  },
};

export function usePayrollDashboard() {
  const [dashboard, setDashboard] = useState<PayrollDashboard>(emptyDashboard);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = () => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    const request = fetch("/api/payroll", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("payroll_load_failed");
        return response.json() as Promise<PayrollResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setDashboard(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return { abort: () => controller.abort(), request };
  };

  useEffect(() => {
    const current = refresh();
    return () => current.abort();
  }, []);

  const refreshDashboard = async () => {
    const current = refresh();
    await current.request;
  };

  return { dashboard, hasError, isLoading, refresh: refreshDashboard };
}
