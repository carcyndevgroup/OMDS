"use client";

import { useCallback, useEffect, useState } from "react";

import type { ClientPortalAccess } from "../types/client-portal";

type PortalResponse = { data?: ClientPortalAccess };

export function useClientPortalAccess(eventId: string) {
  const [access, setAccess] = useState<ClientPortalAccess | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/portal`, {
        signal,
      });
      if (!response.ok) throw new Error("portal_load_failed");
      const result = (await response.json()) as PortalResponse;
      setAccess(result.data ?? null);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setHasError(true);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [eventId]);

  const sync = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    const response = await fetch(`/api/crm/events/${eventId}/portal`, {
      method: "PATCH",
    });
    if (!response.ok) {
      setHasError(true);
      setIsLoading(false);
      throw new Error("portal_sync_failed");
    }
    const result = (await response.json()) as PortalResponse;
    setAccess(result.data ?? null);
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return { access, hasError, isLoading, refresh, sync };
}
