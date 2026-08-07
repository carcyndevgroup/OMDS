import { useCallback, useState } from "react";

import type { ClientEventIds } from "../repositories/client-repository";
import type { ClientFormValues } from "../types/client";
import { resolveVenueDraft } from "../../venue/services/resolve-venue-draft";

type ClientMutationStatus = "idle" | "loading" | "success" | "error";

export function useCreateClient() {
  const [status, setStatus] = useState<ClientMutationStatus>("idle");

  const createClient = useCallback(async (values: ClientFormValues) => {
    setStatus("loading");
    const venueId = await resolveVenueDraft(values.venueId, values.venueDraft);
    const response = await fetch("/api/crm/clients", {
      body: JSON.stringify({ ...values, venueId, venueDraft: null }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("client_create_failed");
    }

    const payload = (await response.json()) as { data: ClientEventIds };
    setStatus("success");
    return payload.data;
  }, []);

  return {
    createClient,
    resetStatus: () => setStatus("idle"),
    status,
  };
}
