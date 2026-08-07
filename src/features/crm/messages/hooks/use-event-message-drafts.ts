"use client";

import { useCallback, useEffect, useState } from "react";

import type { MessageDraft } from "../types/message-draft";

type MessageDraftsResponse = { data?: MessageDraft[] };

export function useEventMessageDrafts(eventId: string) {
  const [drafts, setDrafts] = useState<MessageDraft[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/messages`, { signal });
      if (!response.ok) throw new Error("message_drafts_load_failed");
      const result = (await response.json()) as MessageDraftsResponse;
      setDrafts(result.data ?? []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setHasError(true);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return { drafts, hasError, isLoading, refresh };
}
