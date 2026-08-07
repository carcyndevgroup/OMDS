"use client";

import { ListPlus } from "lucide-react";
import { useState } from "react";

import type { Translate } from "@/features/crm/shared/types/form-types";

type QuoteEventServicesButtonProps = {
  onApply: () => Promise<void>;
  t: Translate;
};

export function QuoteEventServicesButton({ onApply, t }: QuoteEventServicesButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const apply = async () => {
    setIsLoading(true);
    try {
      await onApply();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300/40 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={apply}
      type="button"
    >
      <ListPlus className="h-4 w-4" />
      {isLoading
        ? t("crm.quote.action.applyEventServicesLoading")
        : t("crm.quote.action.applyEventServices")}
    </button>
  );
}
