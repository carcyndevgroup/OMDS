"use client";

import { useCallback, useState } from "react";

import type { EventPlannerFormValues } from "../types/event-planner";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEventPlannerMutation(eventId: string, eventPlannerId?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: EventPlannerFormValues) => {
      setStatus("loading");
      const endpoint = eventPlannerId
        ? `/api/crm/events/${eventId}/planners/${eventPlannerId}`
        : `/api/crm/events/${eventId}/planners`;
      const response = await fetch(endpoint, {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: eventPlannerId ? "PUT" : "POST",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("event_planner_mutation_failed");
      }

      setStatus("success");
    },
    [eventId, eventPlannerId],
  );

  const remove = useCallback(async () => {
    if (!eventPlannerId) return;
    const response = await fetch(`/api/crm/events/${eventId}/planners/${eventPlannerId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("event_planner_delete_failed");
  }, [eventId, eventPlannerId]);

  return { mutate, remove, status };
}
