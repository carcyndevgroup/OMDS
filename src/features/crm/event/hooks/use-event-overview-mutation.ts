"use client";

import { useCallback, useState } from "react";

type MutationStatus = "idle" | "loading" | "success" | "error";

type EventOverviewPayload = {
  bookingStatus: string;
  bookingType: string;
  eventDate: string;
  guestCount: number;
  serviceStartTime: string | null;
};

export function useEventOverviewMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: EventOverviewPayload) => {
      setStatus("loading");
      const response = await fetch(`/api/crm/events/${eventId}`, {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("event_overview_update_failed");
      }

      setStatus("success");
    },
    [eventId],
  );

  return { mutate, status };
}
