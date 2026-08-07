"use client";

import { useEffect, useState } from "react";

import type { DashboardMonthEvent } from "../types/dashboard";

type MonthEventsState = {
  hasError: boolean;
  isLoading: boolean;
  items: DashboardMonthEvent[];
};

export function useMonthEvents(
  month: string,
  includeUnconfirmed = false,
): MonthEventsState {
  const [state, setState] = useState<MonthEventsState>({
    hasError: false,
    isLoading: true,
    items: [],
  });

  useEffect(() => {
    let isMounted = true;
    setState((current) => ({ ...current, hasError: false, isLoading: true }));

    const params = new URLSearchParams({
      includeUnconfirmed: String(includeUnconfirmed),
      month,
    });

    void fetch(`/api/dashboard/events/month?${params.toString()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("month_events_failed");
        return response.json() as Promise<{ data: DashboardMonthEvent[] }>;
      })
      .then((payload) => {
        if (isMounted) {
          setState({ hasError: false, isLoading: false, items: payload.data });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({ hasError: true, isLoading: false, items: [] });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [includeUnconfirmed, month]);

  return state;
}
