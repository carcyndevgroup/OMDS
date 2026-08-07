"use client";

import { useCallback, useEffect, useState } from "react";

import type { Contract } from "../types/contract";

type ContractsResponse = { data?: Contract[] };

export function useContracts(eventId: string) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/contracts`, {
        signal,
      });
      if (!response.ok) throw new Error("contracts_load_failed");
      const result = (await response.json()) as ContractsResponse;
      setContracts(result.data ?? []);
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

  return { contracts, hasError, isLoading, refresh };
}
