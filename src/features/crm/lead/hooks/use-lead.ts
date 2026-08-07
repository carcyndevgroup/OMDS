import { useEffect, useState } from "react";

import type { Lead } from "../types/lead";

type LeadResponse = {
  data: Lead;
};

export function useLead(id: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadLead = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(`/api/crm/leads/${id}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("lead_load_failed");

        const result = (await response.json()) as LeadResponse;
        setLead(result.data);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadLead();
    return () => controller.abort();
  }, [id]);

  return {
    hasError,
    isLoading,
    lead,
  };
}
