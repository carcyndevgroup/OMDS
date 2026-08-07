"use client";

import { useCallback, useState } from "react";

import type { VenueContactFormValues } from "../types/venue-contact";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useVenueContactMutation(venueId: string, contactId?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: VenueContactFormValues) => {
      setStatus("loading");
      const endpoint = contactId
        ? `/api/crm/venues/${venueId}/contacts/${contactId}`
        : `/api/crm/venues/${venueId}/contacts`;

      const response = await fetch(endpoint, {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: contactId ? "PUT" : "POST",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("venue_contact_mutation_failed");
      }

      setStatus("success");
    },
    [contactId, venueId],
  );

  return { mutate, resetStatus: () => setStatus("idle"), status };
}
