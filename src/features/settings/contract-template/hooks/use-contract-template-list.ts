"use client";

import { useCallback, useEffect, useState } from "react";

import type { ContractTemplate } from "../types/contract-template";

export function useContractTemplateList() {
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(async () => {
    setRefreshIndex((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/settings/contract-templates", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("contract_template_list_failed");
        return response.json() as Promise<{ data: ContractTemplate[] }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setContractTemplates(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [refreshIndex]);

  return { contractTemplates, hasError, isLoading, refresh };
}
