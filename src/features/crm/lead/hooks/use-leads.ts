import { useCallback, useEffect, useState } from "react";

import type { Lead } from "../types/lead";

type LeadsResponse = {
  data: Lead[];
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch("/api/crm/leads?includeArchived=1");
      if (!response.ok) throw new Error("lead_list_failed");

      const result = (await response.json()) as LeadsResponse;
      setLeads(result.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const deleteLead = useCallback(async (id: string) => {
    const response = await fetch(`/api/crm/leads/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("lead_delete_failed");

    setLeads((currentLeads) => {
      return currentLeads.filter((lead) => lead.id !== id);
    });
  }, []);

  const archiveLead = useCallback(async (id: string) => {
    const response = await fetch(`/api/crm/archive/leads/${id}`, {
      body: JSON.stringify({ archived: true }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("lead_archive_failed");
    setLeads((currentLeads) => currentLeads.filter((lead) => lead.id !== id));
  }, []);
  const unarchiveLead = useCallback(async (id: string) => {
    const response = await fetch(`/api/crm/archive/leads/${id}`, {
      body: JSON.stringify({ archived: false }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("lead_unarchive_failed");
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, archivedAt: null } : lead));
  }, []);

  return {
    deleteLead,
    archiveLead,
    unarchiveLead,
    hasError,
    isLoading,
    leads,
    reload: loadLeads,
  };
}
