"use client";

import { useCallback, useEffect, useState } from "react";

import type { EmailTemplate } from "../types/email-template";

export function useEmailTemplateList() {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
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

    void fetch("/api/settings/email-templates", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("email_template_list_failed");
        return response.json() as Promise<{ data: EmailTemplate[] }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setEmailTemplates(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [refreshIndex]);

  return { emailTemplates, hasError, isLoading, refresh };
}
