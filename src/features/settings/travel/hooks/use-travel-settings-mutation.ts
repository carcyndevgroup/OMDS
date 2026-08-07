"use client";

import { useCallback, useState } from "react";

import type { TravelSettings } from "../types/travel-settings";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useTravelSettingsMutation() {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const save = useCallback(async (values: TravelSettings) => {
    setStatus("loading");
    const response = await fetch("/api/settings/travel", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("travel_settings_save_failed");
    }

    setStatus("success");
  }, []);

  return { save, status };
}
