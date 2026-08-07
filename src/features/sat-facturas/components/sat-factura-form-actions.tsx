import { Save } from "lucide-react";
import Link from "next/link";

import type { TranslationKey } from "@/core/i18n";

type SatFacturaFormActionsProps = {
  errorKey: TranslationKey;
  status: string;
  submitKey: TranslationKey;
  successKey: TranslationKey;
  t: (key: TranslationKey) => string;
};

export function SatFacturaFormActions(props: SatFacturaFormActionsProps) {
  return (
    <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p aria-live="polite" className="min-h-5 text-sm font-medium">
        {props.status === "success" ? (
          <span className="text-emerald-300">{props.t(props.successKey)}</span>
        ) : null}
        {props.status === "error" ? (
          <span className="text-rose-300">{props.t(props.errorKey)}</span>
        ) : null}
      </p>
      <div className="flex gap-3">
        <Link
          className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200"
          href="/sat-facturas"
        >
          {props.t("common.cancel")}
        </Link>
        <button
          className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950"
          disabled={props.status === "loading"}
          type="submit"
        >
          <Save aria-hidden="true" size={16} />
          {props.t(props.submitKey)}
        </button>
      </div>
    </div>
  );
}
