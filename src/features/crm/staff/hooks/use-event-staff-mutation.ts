"use client";

import { useCallback, useState } from "react";

import type { EventStaffFormValues } from "../types/staff";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEventStaffMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const remove = useCallback(async (assignmentId: string) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/staff/${assignmentId}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setStatus("error");
      throw new Error("event_staff_remove_failed");
    }
    setStatus("success");
  }, [eventId]);

  const upsert = useCallback(async (values: EventStaffFormValues) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/staff`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("event_staff_save_failed");
    }
    setStatus("success");
  }, [eventId]);

  return { remove, status, upsert };
}
