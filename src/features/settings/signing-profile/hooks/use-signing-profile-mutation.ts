"use client";

import { useCallback, useState } from "react";

import type { SigningProfile } from "../types/signing-profile";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useSigningProfileMutation() {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const save = useCallback(async (values: SigningProfile) => {
    setStatus("loading");
    const response = await fetch("/api/settings/signing-profile", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("signing_profile_save_failed");
    }

    setStatus("success");
  }, []);

  return { save, status };
}
