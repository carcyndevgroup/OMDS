"use client";

import { useEffect, useState } from "react";

import type { VenueContact } from "../../venue/types/venue-contact";
import type { VenueSubLocation } from "../../venue/types/venue-sub-location";

type ContactsResponse = { data?: VenueContact[] };
type SubLocationsResponse = { data?: VenueSubLocation[] };

export function useVenueEventOptions(venueId: string) {
  const [contacts, setContacts] = useState<VenueContact[]>([]);
  const [subLocations, setSubLocations] = useState<VenueSubLocation[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    if (!venueId || venueId === "custom") {
      setContacts([]);
      setSubLocations([]);
      return () => controller.abort();
    }

    void Promise.all([
      fetch(`/api/crm/venues/${venueId}/contacts`, { signal: controller.signal })
        .then((response) => response.json() as Promise<ContactsResponse>),
      fetch(`/api/crm/venues/${venueId}/sub-locations`, { signal: controller.signal })
        .then((response) => response.json() as Promise<SubLocationsResponse>),
    ])
      .then(([contactResult, subLocationResult]) => {
        if (controller.signal.aborted) return;
        setContacts(contactResult.data ?? []);
        setSubLocations(subLocationResult.data ?? []);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setContacts([]);
        setSubLocations([]);
      });

    return () => controller.abort();
  }, [venueId]);

  return { contacts, subLocations };
}
