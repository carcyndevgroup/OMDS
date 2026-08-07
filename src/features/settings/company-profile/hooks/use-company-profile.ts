"use client";

import { useCallback, useEffect, useState } from "react";

import type { CompanyProfile, CompanyProfileResponse } from "../types/company-profile";

export function useCompanyProfile() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/company-profile");
      if (!response.ok) throw new Error("company_profile_load_failed");
      const payload = (await response.json()) as CompanyProfileResponse;
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
