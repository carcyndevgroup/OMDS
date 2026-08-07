import { useCallback, useState } from "react";

import type { LeadFormValues } from "../types/lead";
import { resolveVenueDraft } from "../../venue/services/resolve-venue-draft";

type UpdateLeadStatus = "idle" | "loading" | "success" | "error";

export function useUpdateLead(id: string) {
  const [status, setStatus] = useState<UpdateLeadStatus>("idle");

  const updateLead = useCallback(
    async (values: LeadFormValues) => {
      setStatus("loading");

      const venueId = await resolveVenueDraft(values.venueId, values.venueDraft);
      const response = await fetch(`/api/crm/leads/${id}`, {
        body: JSON.stringify({ ...values, venueId, venueDraft: null }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("lead_update_failed");
      }

      setStatus("success");
    },
    [id],
  );

  const resetStatus = useCallback(() => {
    setStatus("idle");
  }, []);

  return {
    resetStatus,
    status,
    updateLead,
  };
}
