"use client";

import { useCallback, useEffect, useState } from "react";

import type { VenueContact } from "../types/venue-contact";

export function useVenueContacts(venueId: string) {
  const [contacts, setContacts] = useState<VenueContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/venues/${venueId}/contacts`);
      if (!response.ok) throw new Error("venue_contacts_load_failed");
      const payload = (await response.json()) as { data: VenueContact[] };
      setContacts(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { contacts, hasError, isLoading, refresh };
}
