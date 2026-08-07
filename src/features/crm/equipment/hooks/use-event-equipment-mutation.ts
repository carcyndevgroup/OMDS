"use client";

import { useCallback, useState } from "react";

import type { EventEquipmentFormValues } from "../types/event-equipment";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEventEquipmentMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const remove = useCallback(async (assignmentId: string) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/equipment/${assignmentId}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setStatus("error");
      throw new Error("event_equipment_remove_failed");
    }
    setStatus("success");
  }, [eventId]);

  const upsert = useCallback(async (values: EventEquipmentFormValues) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/equipment`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("event_equipment_save_failed");
    }
    setStatus("success");
  }, [eventId]);

  return { remove, status, upsert };
}
