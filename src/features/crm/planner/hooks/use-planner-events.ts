"use client";

import { useCallback, useEffect, useState } from "react";

import type { PlannerEventListItem } from "../types/planner-event";

export function usePlannerEvents(plannerId: string) {
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/planners/${plannerId}/events`);
      if (!response.ok) throw new Error("planner_events_load_failed");
      const payload = (await response.json()) as { data: PlannerEventListItem[] };
      setEvents(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [plannerId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { events, hasError, isLoading, refresh };
}
