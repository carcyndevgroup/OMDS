import { useCallback, useState } from "react";

import type { Lead, LeadFormValues } from "../types/lead";
import { resolveVenueDraft } from "../../venue/services/resolve-venue-draft";

type CreateLeadStatus = "idle" | "loading" | "success" | "error";

export function useCreateLead() {
  const [status, setStatus] = useState<CreateLeadStatus>("idle");

  const createLead = useCallback(async (values: LeadFormValues) => {
    setStatus("loading");

    const venueId = await resolveVenueDraft(values.venueId, values.venueDraft);
    const response = await fetch("/api/crm/leads", {
      body: JSON.stringify({ ...values, venueId, venueDraft: null }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("lead_create_failed");
    }

    const payload = (await response.json()) as { data: Lead };
    setStatus("success");
    return payload.data;
  }, []);

  const resetStatus = useCallback(() => {
    setStatus("idle");
  }, []);

  return {
    createLead,
    resetStatus,
    status,
  };
}
