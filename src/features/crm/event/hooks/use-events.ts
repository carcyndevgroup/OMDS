"use client";

import { useEffect, useState } from "react";

import type { EventListItem } from "../types/event";

type EventsResponse = { data: EventListItem[] };

export function useEvents() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/crm/events", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("event_list_failed");
        return response.json() as Promise<EventsResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setEvents(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { events, hasError, isLoading };
}
