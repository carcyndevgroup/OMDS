"use client";

import { useCallback, useEffect, useState } from "react";

import type { SigningProfile, SigningProfileResponse } from "../types/signing-profile";

export function useSigningProfile() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<SigningProfile | null>(null);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/signing-profile");
      if (!response.ok) throw new Error("signing_profile_load_failed");
      const payload = (await response.json()) as SigningProfileResponse;
      setProfile(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { hasError, isLoading, profile, refresh };
}
