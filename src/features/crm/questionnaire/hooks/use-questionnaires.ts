"use client";

import { useCallback, useEffect, useState } from "react";

import type { Questionnaire } from "../types/questionnaire";

type QuestionnairesResponse = { data?: Questionnaire[] };

export function useQuestionnaires(eventId: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/questionnaires`, {
        signal,
      });
      if (!response.ok) throw new Error("questionnaires_load_failed");
      const result = (await response.json()) as QuestionnairesResponse;
      setQuestionnaires(result.data ?? []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setHasError(true);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return { hasError, isLoading, questionnaires, refresh };
}
