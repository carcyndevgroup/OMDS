"use client";

import { useCallback, useState } from "react";

import type { EmailTemplateFormValues } from "../types/email-template";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEmailTemplateMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: EmailTemplateFormValues) => {
      setStatus("loading");
      const response = await fetch(
        id ? `/api/settings/email-templates/${id}` : "/api/settings/email-templates",
        {
          body: JSON.stringify(values),
          headers: { "Content-Type": "application/json" },
          method: id ? "PUT" : "POST",
        },
      );

      if (!response.ok) {
        setStatus("error");
        throw new Error("email_template_mutation_failed");
      }

      setStatus("success");
    },
    [id],
  );

  const setActive = useCallback(async (templateId: string, isActive: boolean) => {
    setStatus("loading");
    const response = await fetch(`/api/settings/email-templates/${templateId}`, {
      body: JSON.stringify({ isActive }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("email_template_activation_failed");
    }

    setStatus("success");
  }, []);

  const remove = useCallback(async (templateId: string) => {
    setStatus("loading");
    const response = await fetch(`/api/settings/email-templates/${templateId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatus("error");
      const payload = (await response.json().catch(() => null)) as { code?: unknown } | null;
      const code = typeof payload?.code === "string" ? payload.code : "email_template_delete_failed";
      throw new Error(code);
    }

    setStatus("success");
  }, []);

  return { mutate, remove, setActive, status };
}
