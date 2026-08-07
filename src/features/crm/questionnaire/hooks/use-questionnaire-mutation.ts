"use client";

import { useCallback, useState } from "react";

import type { Locale } from "@/core/i18n";
import type { QuestionnaireAction } from "../types/questionnaire";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useQuestionnaireMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const create = useCallback(async (locale: Locale) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/questionnaires`, {
      body: JSON.stringify({ locale }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("questionnaire_create_failed");
    }
    setStatus("success");
  }, [eventId]);

  const workflow = useCallback(async (
    questionnaireId: string,
    action: QuestionnaireAction,
    reviewNotes = "",
    clientId?: string,
  ) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/questionnaires/${questionnaireId}`,
      {
        body: JSON.stringify({ action, clientId, reviewNotes }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      },
    );
    if (!response.ok) {
      setStatus("error");
      throw new Error("questionnaire_workflow_failed");
    }
    setStatus("success");
  }, [eventId]);

  return { create, status, workflow };
}
