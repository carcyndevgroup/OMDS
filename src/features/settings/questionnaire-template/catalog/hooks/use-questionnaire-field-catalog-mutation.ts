"use client";

import { useCallback, useState } from "react";

import type { QuestionnaireFieldCatalogFormValues } from "../types/questionnaire-field-catalog";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useQuestionnaireFieldCatalogMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(async (values: QuestionnaireFieldCatalogFormValues) => {
    setStatus("loading");
    const response = await fetch(id ? `/api/settings/questionnaire-field-catalog/${id}` : "/api/settings/questionnaire-field-catalog", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: id ? "PUT" : "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("questionnaire_field_catalog_mutation_failed");
    }

    setStatus("success");
  }, [id]);

  return { mutate, status };
}
