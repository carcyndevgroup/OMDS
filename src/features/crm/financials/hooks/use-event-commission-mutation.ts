"use client";

import { useCallback, useState } from "react";

import type { EventCommissionFormValues } from "../types/event-commission";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEventCommissionMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const save = useCallback(async (
    values: EventCommissionFormValues,
    commissionId?: string,
  ) => {
    setStatus("loading");
    const url = commissionId
      ? `/api/crm/events/${eventId}/commissions/${commissionId}`
      : `/api/crm/events/${eventId}/commissions`;
    const response = await fetch(url, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: commissionId ? "PATCH" : "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_commission_save_failed");
    }

    setStatus("success");
  }, [eventId]);

  const remove = useCallback(async (commissionId: string) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/commissions/${commissionId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_commission_remove_failed");
    }

    setStatus("success");
  }, [eventId]);

  return { remove, save, status };
}
