"use client";

import { useCallback, useEffect, useState } from "react";

import type { ClientListItem } from "../types/client";

type ClientsResponse = { data: ClientListItem[] };

export function useClients() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const archiveClient = useCallback(async (id: string) => {
    const response = await fetch(`/api/crm/archive/clients/${id}`, {
      body: JSON.stringify({ archived: true }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("client_archive_failed");
    setClients((currentClients) => currentClients.filter((client) => client.id !== id));
  }, []);
  const unarchiveClient = useCallback(async (id: string) => {
    const response = await fetch(`/api/crm/archive/clients/${id}`, { body: JSON.stringify({ archived: false }), headers: { "Content-Type": "application/json" }, method: "PATCH" });
    if (!response.ok) throw new Error("client_unarchive_failed");
    setClients((current) => current.map((client) => client.id === id ? { ...client, archivedAt: null } : client));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/crm/clients?includeArchived=1", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("client_list_failed");
        return response.json() as Promise<ClientsResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setClients(result.data);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { archiveClient, clients, hasError, isLoading, unarchiveClient };
}
