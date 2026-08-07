"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventPlanner } from "../types/event-planner";

export function useEventPlanners(eventId: string | null) {
  const [eventPlanners, setEventPlanners] = useState<EventPlanner[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(eventId));
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/planners`);
      if (!response.ok) throw new Error("event_planners_load_failed");
      const payload = (await response.json()) as { data: EventPlanner[] };
      setEventPlanners(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { eventPlanners, hasError, isLoading, refresh };
}
