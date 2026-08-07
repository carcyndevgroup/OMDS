"use client";

import { useEffect, useState } from "react";

import type { PendingQuestionnaireReview } from "../types/dashboard";

type PendingQuestionnairesResponse = {
  data: PendingQuestionnaireReview[];
};

export function usePendingQuestionnaires() {
  const [items, setItems] = useState<PendingQuestionnaireReview[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/dashboard/questionnaires/pending", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("pending_questionnaires_failed");
        return response.json() as Promise<PendingQuestionnairesResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setItems(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { hasError, isLoading, items };
}
