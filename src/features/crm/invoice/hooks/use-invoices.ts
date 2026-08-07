"use client";

import { useCallback, useEffect, useState } from "react";

import type { Invoice } from "../types/invoice";

type InvoicesResponse = { data?: Invoice[] };

export function useInvoices(eventId: string) {
  const [hasError, setHasError] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/invoices`, {
        signal,
      });
      if (!response.ok) throw new Error("invoices_load_failed");
      const result = (await response.json()) as InvoicesResponse;
      setInvoices(result.data ?? []);
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

  return { hasError, invoices, isLoading, refresh };
}
