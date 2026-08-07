"use client";

import { useCallback, useEffect, useState } from "react";

import type { QuestionnaireTemplate } from "../types/questionnaire-template";

export function useQuestionnaireTemplateList() {
  const [questionnaireTemplates, setQuestionnaireTemplates] = useState<QuestionnaireTemplate[]>([]);
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

    void fetch("/api/settings/questionnaire-templates", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("questionnaire_template_list_failed");
        return response.json() as Promise<{ data: QuestionnaireTemplate[] }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setQuestionnaireTemplates(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [refreshIndex]);

  return { hasError, isLoading, questionnaireTemplates, refresh };
}
