"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventPayrollLineItem } from "../types/event-payroll-line-item";

export function useEventPayrollLineItems(eventId: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lineItems, setLineItems] = useState<EventPayrollLineItem[]>([]);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/payroll-line-items`);
      if (!response.ok) throw new Error("event_payroll_line_items_load_failed");
      const payload = (await response.json()) as { data: EventPayrollLineItem[] };
      setLineItems(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { hasError, isLoading, lineItems, refresh };
}
