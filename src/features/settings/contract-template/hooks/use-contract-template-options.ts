"use client";

import { useEffect, useMemo, useState } from "react";

import type { ContractTemplate } from "../types/contract-template";

export function useContractTemplateOptions() {
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const options = useMemo(
    () => contractTemplates.filter((template) => template.isActive),
    [contractTemplates],
  );

  return { hasError, isLoading, options };
}
