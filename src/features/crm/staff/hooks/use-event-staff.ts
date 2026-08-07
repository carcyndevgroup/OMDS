"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventStaffAssignment } from "../types/staff";

export function useEventStaff(eventId: string) {
  const [assignments, setAssignments] = useState<EventStaffAssignment[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/staff`);
      if (!response.ok) throw new Error("event_staff_load_failed");
      const payload = (await response.json()) as { data: EventStaffAssignment[] };
      setAssignments(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { assignments, hasError, isLoading, refresh };
}
