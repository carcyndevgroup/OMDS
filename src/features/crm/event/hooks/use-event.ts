"use client";

import { useEffect, useState } from "react";

import type { EventDetail } from "../types/event";

type EventResponse = { data: EventDetail };

export function useEvent(id: string) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/crm/events/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("event_detail_failed");
        return response.json() as Promise<EventResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setEvent(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { event, hasError, isLoading };
}
