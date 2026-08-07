"use client";

import { useEffect, useState } from "react";

import type { SatSettings } from "../types/sat-settings";

type SatSettingsResponse = { data: SatSettings };

export function useSatSettings() {
  const [settings, setSettings] = useState<SatSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch("/api/sat-facturas/settings");
        if (!response.ok) throw new Error("sat_settings_failed");
        const payload = (await response.json()) as SatSettingsResponse;
        if (isMounted) setSettings(payload.data);
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return { hasError, isLoading, settings };
}
