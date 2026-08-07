"use client";

import { useEffect, useState } from "react";

import type { TranslationKey } from "@/core/i18n";

type StaffResult = { id: string; label: string };

type Props = {
  onChange: (value: string) => void;
  t: (key: TranslationKey) => string;
  value: string;
};

export function StaffLookupField({ onChange, t, value }: Props) {
  const [results, setResults] = useState<StaffResult[]>([]);

  useEffect(() => {
    if (value.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    void fetch(`/api/messages/crm-search?type=staff&q=${encodeURIComponent(value)}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ data?: StaffResult[] }>)
      .then((result) => {
        if (!controller.signal.aborted) setResults(result.data ?? []);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [value]);

  return (
    <label className="space-y-1">
      <span className="sr-only">{t("messages.assignedTo")}</span>
      <input className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200" list="message-crm-staff" onChange={(event) => onChange(event.target.value)} placeholder={t("messages.assignedTo")} value={value} />
      <datalist id="message-crm-staff">
        {results.map((result) => <option key={result.id} label={result.label} value={result.id}>{result.label}</option>)}
      </datalist>
    </label>
  );
}
