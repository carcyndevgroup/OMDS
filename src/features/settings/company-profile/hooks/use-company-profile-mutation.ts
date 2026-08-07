"use client";

import { useCallback, useState } from "react";

import type { CompanyProfile } from "../types/company-profile";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useCompanyProfileMutation() {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const save = useCallback(async (values: CompanyProfile) => {
    setStatus("loading");
    const response = await fetch("/api/settings/company-profile", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("company_profile_save_failed");
    }

    setStatus("success");
  }, []);

  return { save, status };
}
