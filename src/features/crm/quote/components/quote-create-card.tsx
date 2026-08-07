"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteCreateValues } from "../types/quote";

type QuoteCreateCardProps = {
  onCreate: (values: QuoteCreateValues) => Promise<void>;
  t: Translate;
};

export function QuoteCreateCard({ onCreate, t }: QuoteCreateCardProps) {
  const [title, setTitle] = useState("");

  const create = async () => {
    if (!title.trim()) return;
    await onCreate({ title });
    setTitle("");
  };

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <CrmTextInput
          label={t("crm.quote.field.title")}
          onChange={setTitle}
          t={t}
          value={title}
        />
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950"
          onClick={create}
          type="button"
        >
          <Plus aria-hidden="true" size={16} />
          {t("crm.quote.action.create")}
        </button>
      </div>
    </div>
  );
}
