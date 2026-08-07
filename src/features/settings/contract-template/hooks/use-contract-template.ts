"use client";

import { useEffect, useState } from "react";

import type { ContractTemplate } from "../types/contract-template";

export function useContractTemplate(id: string) {
  const [contractTemplate, setContractTemplate] = useState<ContractTemplate | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/settings/contract-templates/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("contract_template_load_failed");
        return response.json() as Promise<{ data: ContractTemplate }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setContractTemplate(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  return {
    contractTemplate,
    hasError,
    isLoading,
    reload: () => setReloadKey((value) => value + 1),
  };
}
