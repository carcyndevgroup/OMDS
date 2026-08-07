"use client";

import { useEffect, useState } from "react";

import type { QuestionnaireFieldCatalogItem } from "../types/questionnaire-field-catalog";

export function useQuestionnaireFieldCatalog(id: string) {
  const [item, setItem] = useState<QuestionnaireFieldCatalogItem | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/settings/questionnaire-field-catalog/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("questionnaire_field_catalog_load_failed");
        return response.json() as Promise<{ data: QuestionnaireFieldCatalogItem }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setItem(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { hasError, isLoading, item };
}
