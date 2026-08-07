"use client";

import { useEffect, useState } from "react";

import type { UpcomingDashboardEvent } from "../types/dashboard";

type UpcomingEventsState = {
  hasError: boolean;
  isLoading: boolean;
  items: UpcomingDashboardEvent[];
};

export function useUpcomingEvents(): UpcomingEventsState {
  const [state, setState] = useState<UpcomingEventsState>({
    hasError: false,
    isLoading: true,
    items: [],
  });

  useEffect(() => {
    let isMounted = true;

    void fetch("/api/dashboard/events/upcoming", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("upcoming_events_failed");
        return response.json() as Promise<{ data: UpcomingDashboardEvent[] }>;
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
  }, []);

  return state;
}
