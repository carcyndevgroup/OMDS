import { AlertTriangle } from "lucide-react";

import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../types/form-types";

type ConfirmationDialogProps = {
  cancelKey?: TranslationKey;
  confirmKey: TranslationKey;
  errorKey?: TranslationKey;
  isOpen: boolean;
  isWorking?: boolean;
  messageKey: TranslationKey;
  onCancel: () => void;
  onConfirm: () => void;
  t: Translate;
  titleKey: TranslationKey;
};

export function ConfirmationDialog({
  cancelKey = "common.cancel",
  confirmKey,
  errorKey,
  isOpen,
  isWorking = false,
  messageKey,
  onCancel,
  onConfirm,
  t,
  titleKey,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 p-5 shadow-2xl shadow-black/40"
        role="dialog"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-rose-400/10 text-rose-300">
            <AlertTriangle aria-hidden="true" size={20} />
          </span>
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg font-bold text-white">{t(titleKey)}</h2>
            <p className="text-sm leading-6 text-zinc-400">{t(messageKey)}</p>
          </div>
        </div>
        {errorKey ? <p className="mt-4 text-sm text-rose-300">{t(errorKey)}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 transition hover:bg-white/[0.04]"
            disabled={isWorking}
            onClick={onCancel}
            type="button"
          >
            {t(cancelKey)}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-rose-400/40 bg-rose-400/10 px-4 text-sm font-bold text-rose-200 transition hover:bg-rose-400/20 disabled:opacity-60"
            disabled={isWorking}
            onClick={onConfirm}
            type="button"
          >
            {t(confirmKey)}
          </button>
        </div>
      </div>
    </div>
  );
}
