"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventFile } from "../types/event-file";

export function useEventFiles(eventId: string) {
  const [files, setFiles] = useState<EventFile[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/files`);
      if (!response.ok) throw new Error("event_files_load_failed");
      const payload = (await response.json()) as { data: EventFile[] };
      setFiles(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { files, hasError, isLoading, refresh };
}
