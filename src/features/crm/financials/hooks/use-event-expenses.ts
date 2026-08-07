"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventExpense } from "../types/event-expense";

export function useEventExpenses(eventId: string) {
  const [expenses, setExpenses] = useState<EventExpense[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/expenses`);
      if (!response.ok) throw new Error("event_expenses_load_failed");
      const payload = (await response.json()) as { data: EventExpense[] };
      setExpenses(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { expenses, hasError, isLoading, refresh };
}
