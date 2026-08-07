import type { ReactNode } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../types/form-types";

type CrmFieldProps = {
  children: ReactNode;
  error?: TranslationKey;
  label: string;
  t: Translate;
};

export function CrmField({ children, error, label, t }: CrmFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs font-medium text-rose-300">
          {t(error)}
        </span>
      ) : null}
    </label>
  );
}
