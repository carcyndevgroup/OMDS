"use client";

import { useEffect, useState } from "react";

import type { DashboardSummary } from "../types/dashboard";

type DashboardSummaryState = {
  hasError: boolean;
  isLoading: boolean;
  summary: DashboardSummary | null;
};

export function useDashboardSummary(): DashboardSummaryState {
  const [state, setState] = useState<DashboardSummaryState>({
    hasError: false,
    isLoading: true,
    summary: null,
  });

  useEffect(() => {
    let isMounted = true;

    void fetch("/api/dashboard/summary", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("dashboard_summary_failed");
        return response.json() as Promise<{ data: DashboardSummary }>;
      })
      .then((payload) => {
        if (isMounted) {
          setState({ hasError: false, isLoading: false, summary: payload.data });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({ hasError: true, isLoading: false, summary: null });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
