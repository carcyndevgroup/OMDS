"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  TravelSettings,
  TravelSettingsResponse,
} from "../types/travel-settings";

export function useTravelSettings() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<TravelSettings | null>(null);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/travel");
      if (!response.ok) throw new Error("travel_settings_load_failed");
      const payload = (await response.json()) as TravelSettingsResponse;
      setSettings(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { hasError, isLoading, refresh, settings };
}
