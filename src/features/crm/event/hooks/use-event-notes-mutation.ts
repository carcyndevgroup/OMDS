"use client";

import { useCallback, useState } from "react";

type MutationStatus = "idle" | "loading" | "success" | "error";

type EventNotesPayload = {
  internalIssueNotes?: string;
  notes?: string;
  operationsNotes?: string;
};

export function useEventNotesMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: EventNotesPayload) => {
      setStatus("loading");
      const response = await fetch(`/api/crm/events/${eventId}/notes`, {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("event_notes_update_failed");
      }

      setStatus("success");
    },
    [eventId],
  );

  return { mutate, status };
}
