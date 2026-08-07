"use client";

import { useEffect, useState } from "react";

import type { SatFiscalProfile } from "../types/sat-settings";

type FiscalProfileResponse = { data: SatFiscalProfile };

export function useSatFiscalProfile(profileId: string) {
  const [profile, setProfile] = useState<SatFiscalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch(`/api/sat-facturas/fiscal-profiles/${profileId}`);
        if (!response.ok) throw new Error("profile_load_failed");
        const payload = (await response.json()) as FiscalProfileResponse;
        if (isMounted) setProfile(payload.data);
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  return { hasError, isLoading, profile };
}
