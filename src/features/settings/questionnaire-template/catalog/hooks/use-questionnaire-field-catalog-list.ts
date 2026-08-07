"use client";

import { useEffect, useState } from "react";

import type { QuestionnaireFieldCatalogItem } from "../types/questionnaire-field-catalog";

export function useQuestionnaireFieldCatalogList() {
  const [items, setItems] = useState<QuestionnaireFieldCatalogItem[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/settings/questionnaire-field-catalog", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("questionnaire_field_catalog_list_failed");
        return response.json() as Promise<{ data: QuestionnaireFieldCatalogItem[] }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setItems(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadToken]);

  const reload = () => setReloadToken((value) => value + 1);

  return { hasError, isLoading, items, reload };
}
