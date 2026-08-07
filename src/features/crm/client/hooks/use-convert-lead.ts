import { useCallback, useState } from "react";

import type { ClientFormValues } from "../types/client";

type ConversionStatus = "idle" | "loading" | "success" | "error";

export function useConvertLead(leadId: string) {
  const [status, setStatus] = useState<ConversionStatus>("idle");

  const convertLead = useCallback(
    async (values: ClientFormValues) => {
      setStatus("loading");
      const response = await fetch(`/api/crm/leads/${leadId}/convert`, {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("lead_conversion_failed");
      }

      setStatus("success");
    },
    [leadId],
  );

  return {
    convertLead,
    resetStatus: () => setStatus("idle"),
    status,
  };
}
