"use client";

import { useCallback, useState } from "react";

import type { Locale } from "@/core/i18n";

import type { ContractAction } from "../types/contract";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useContractMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const create = useCallback(async (locale: Locale) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/contracts`, {
      body: JSON.stringify({ locale }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("contract_create_failed");
    }
    setStatus("success");
  }, [eventId]);

  const workflow = useCallback(async (
    contractId: string,
    action: ContractAction,
  ) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/contracts/${contractId}`,
      {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      },
    );
    if (!response.ok) {
      setStatus("error");
      throw new Error("contract_workflow_failed");
    }
    setStatus("success");
  }, [eventId]);

  return { create, status, workflow };
}
