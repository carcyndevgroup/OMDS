"use client";

import { useCallback, useState } from "react";

import type { MessageDraftCreateInput, MessageDraftStatus } from "../types/message-draft";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useMessageDraftMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const create = useCallback(async (input: MessageDraftCreateInput) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/messages`, {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("message_draft_create_failed");
    }

    setStatus("success");
  }, [eventId]);

  const updateStatus = useCallback(async (messageId: string, draftStatus: MessageDraftStatus) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/messages/${messageId}`, {
      body: JSON.stringify({ status: draftStatus }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("message_draft_update_failed");
    }

    setStatus("success");
  }, [eventId]);

  return { create, status, updateStatus };
}
