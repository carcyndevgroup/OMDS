"use client";

import { useCallback, useEffect, useState } from "react";

import type { QuoteSummary } from "../types/quote";

export function useEventQuotes(eventId: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/quotes`);
      if (!response.ok) throw new Error("quotes_load_failed");
      const payload = (await response.json()) as { data: QuoteSummary[] };
      setQuotes(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { hasError, isLoading, quotes, refresh };
}
