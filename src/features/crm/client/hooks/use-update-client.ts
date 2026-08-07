"use client";

import { useCallback, useState } from "react";

import type { ClientFormValues } from "../types/client";
import { resolveVenueDraft } from "../../venue/services/resolve-venue-draft";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useUpdateClient(clientId: string, eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const updateClient = useCallback(
    async (values: ClientFormValues) => {
      setStatus("loading");
      const venueId = await resolveVenueDraft(values.venueId, values.venueDraft);
      const response = await fetch(`/api/crm/clients/${clientId}`, {
        body: JSON.stringify({ eventId, values: { ...values, venueId, venueDraft: null } }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("client_update_failed");
      }

      setStatus("success");
    },
    [clientId, eventId],
  );

  return {
    resetStatus: () => setStatus("idle"),
    status,
    updateClient,
  };
}
