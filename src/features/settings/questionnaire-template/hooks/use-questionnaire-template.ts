"use client";

import { useEffect, useState } from "react";

import type { QuestionnaireTemplate } from "../types/questionnaire-template";

export function useQuestionnaireTemplate(id: string) {
  const [questionnaireTemplate, setQuestionnaireTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/settings/questionnaire-templates/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("questionnaire_template_load_failed");
        return response.json() as Promise<{ data: QuestionnaireTemplate }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setQuestionnaireTemplate(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { hasError, isLoading, questionnaireTemplate };
}
