"use client";

import { Check, Clipboard } from "lucide-react";
import { useState } from "react";

import type { TranslationKey } from "@/core/i18n";

type SatCopyButtonProps = {
  t: (key: TranslationKey) => string;
  value: string;
};

export function SatCopyButton({ t, value }: SatCopyButtonProps) {
  const [wasCopied, setWasCopied] = useState(false);

  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setWasCopied(true);
    window.setTimeout(() => setWasCopied(false), 1800);
  };

  const Icon = wasCopied ? Check : Clipboard;

  return (
    <button
      className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-300/30 px-3 text-xs font-bold text-cyan-200 transition hover:border-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={!value}
      onClick={copy}
      type="button"
    >
      <Icon aria-hidden="true" size={14} />
      {t(wasCopied ? "satFacturas.action.copied" : "satFacturas.action.copy")}
    </button>
  );
}
