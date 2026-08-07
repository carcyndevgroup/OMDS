"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventEquipmentAssignment } from "../types/event-equipment";

export function useEventEquipment(eventId: string) {
  const [assignments, setAssignments] = useState<EventEquipmentAssignment[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/equipment`);
      if (!response.ok) throw new Error("event_equipment_load_failed");
      const payload = (await response.json()) as {
        data: EventEquipmentAssignment[];
      };
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
