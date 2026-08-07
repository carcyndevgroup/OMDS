"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventStaffPayroll } from "../types/event-staff-payroll";

export function useEventStaffPayroll(eventId: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [payroll, setPayroll] = useState<EventStaffPayroll[]>([]);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/payroll`);
      if (!response.ok) throw new Error("event_staff_payroll_load_failed");
      const payload = (await response.json()) as { data: EventStaffPayroll[] };
      setPayroll(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { hasError, isLoading, payroll, refresh };
}
