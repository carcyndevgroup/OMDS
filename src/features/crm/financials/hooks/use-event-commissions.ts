"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventCommission } from "../types/event-commission";

export function useEventCommissions(eventId: string) {
  const [commissions, setCommissions] = useState<EventCommission[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/commissions`);
      if (!response.ok) throw new Error("event_commissions_load_failed");
      const payload = (await response.json()) as { data: EventCommission[] };
      setCommissions(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { commissions, hasError, isLoading, refresh };
}
