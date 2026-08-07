"use client";

import { useEffect, useState } from "react";

import type { TranslationKey } from "@/core/i18n";

type LookupType = "clients" | "events" | "leads";
type Result = { id: string; label: string };

type Props = {
  labelKey: TranslationKey;
  onChange: (value: string) => void;
  type: LookupType;
  value: string;
  t: (key: TranslationKey) => string;
};

export function CrmLookupField({ labelKey, onChange, type, value, t }: Props) {
  const [results, setResults] = useState<Result[]>([]);
  const listId = `message-crm-${type}`;

  useEffect(() => {
    if (value.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    void fetch(`/api/messages/crm-search?type=${type}&q=${encodeURIComponent(value)}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ data?: Result[] }>)
      .then((result) => {
        if (!controller.signal.aborted) setResults(result.data ?? []);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [type, value]);

  return (
    <label className="space-y-1">
      <span className="sr-only">{t(labelKey)}</span>
      <input className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200" list={listId} onChange={(event) => onChange(event.target.value)} placeholder={t(labelKey)} value={value} />
      <datalist id={listId}>
        {results.map((result) => <option key={result.id} label={result.label} value={result.id}>{result.label}</option>)}
      </datalist>
    </label>
  );
}
