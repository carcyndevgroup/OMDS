"use client";

import { useCallback, useEffect, useState } from "react";

import type { PayrollEventDetail } from "../types/payroll";

type EventState = {
  event: PayrollEventDetail | null;
  hasError: boolean;
  isLoading: boolean;
};

export function usePayrollEvent(eventId: string) {
  const [state, setState] = useState<EventState>({
    event: null,
    hasError: false,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, hasError: false, isLoading: true }));

    try {
      const response = await fetch(`/api/payroll/events/${eventId}`);
      if (!response.ok) throw new Error("payroll_event_load_failed");
      const payload = (await response.json()) as { data: PayrollEventDetail };
      setState({ event: payload.data, hasError: false, isLoading: false });
    } catch {
      setState({ event: null, hasError: true, isLoading: false });
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
