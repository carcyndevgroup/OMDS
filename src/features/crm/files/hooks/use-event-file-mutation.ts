"use client";

import { useCallback, useState } from "react";

import type { EventFileFormValues } from "../types/event-file";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEventFileMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const create = useCallback(async (values: EventFileFormValues) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/files`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("event_file_create_failed");
    }
    setStatus("success");
  }, [eventId]);

  const remove = useCallback(async (fileId: string) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/files/${fileId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("event_file_remove_failed");
    }
    setStatus("success");
  }, [eventId]);

  return { create, remove, status };
}
