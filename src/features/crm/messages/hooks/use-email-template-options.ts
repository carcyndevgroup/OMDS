"use client";

import { useEffect, useMemo, useState } from "react";

type EmailTemplateOption = {
  body: string;
  documentKind: "questionnaire" | "contract" | "invoice" | "quote" | "general";
  isActive: boolean;
  subject: string;
  templateKey: string;
  title: string;
};

export function useEmailTemplateOptions(documentKind: EmailTemplateOption["documentKind"]) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<EmailTemplateOption[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/settings/email-templates", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("email_template_list_failed");
        return response.json() as Promise<{ data: EmailTemplateOption[] }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setOptions(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter((option) => option.isActive && option.documentKind === documentKind);
  }, [documentKind, options]);

  return { hasError, isLoading, options: filteredOptions };
}
