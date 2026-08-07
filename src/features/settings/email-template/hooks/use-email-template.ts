"use client";

import { useEffect, useState } from "react";

import type { EmailTemplate } from "../types/email-template";

export function useEmailTemplate(id: string) {
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/settings/email-templates/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("email_template_load_failed");
        return response.json() as Promise<{ data: EmailTemplate }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setEmailTemplate(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  return {
    emailTemplate,
    hasError,
    isLoading,
    reload: () => setReloadKey((value) => value + 1),
  };
}
