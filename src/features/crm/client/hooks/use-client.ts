"use client";

import { useCallback, useEffect, useState } from "react";

import type { ClientDetail } from "../types/client";

type ClientResponse = { data: ClientDetail };

export function useClient(id: string) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback((signal?: AbortSignal) => {
    setClient(null);
    setHasError(false);
    setIsLoading(true);

    return fetch(`/api/crm/clients/${id}`, { signal })
      .then((response) => {
        if (!response.ok) throw new Error("client_load_failed");
        return response.json() as Promise<ClientResponse>;
      })
      .then((result) => setClient(result.data))
      .catch((error: unknown) => {
        if (!signal?.aborted) setHasError(true);
      })
      .finally(() => {
        if (!signal?.aborted) setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);

    return () => controller.abort();
  }, [load]);

  return { client, hasError, isLoading, refresh: load };
}
