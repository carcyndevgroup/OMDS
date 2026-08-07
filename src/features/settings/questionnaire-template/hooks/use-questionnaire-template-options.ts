"use client";

import { useEffect, useMemo, useState } from "react";

import type { QuestionnaireTemplate } from "../types/questionnaire-template";

export function useQuestionnaireTemplateOptions() {
  const [questionnaireTemplates, setQuestionnaireTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const options = useMemo(
    () => questionnaireTemplates.filter((template) => template.isActive),
    [questionnaireTemplates],
  );

  return { hasError, isLoading, options };
}
