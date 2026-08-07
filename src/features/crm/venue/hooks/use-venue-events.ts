"use client";

import { useCallback, useEffect, useState } from "react";

import type { VenueEventListItem } from "../types/venue-event";

export function useVenueEvents(venueId: string) {
  const [events, setEvents] = useState<VenueEventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/venues/${venueId}/events`);
      if (!response.ok) throw new Error("venue_events_load_failed");
      const payload = (await response.json()) as { data: VenueEventListItem[] };
      setEvents(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { events, hasError, isLoading, refresh };
}
