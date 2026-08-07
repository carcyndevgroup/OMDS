import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../types/form-types";
import { CrmField } from "./crm-field";

type SelectOption =
  | { label: string; translationKey?: never; value: string }
  | { label?: never; translationKey: TranslationKey; value: string };

type CrmSelectProps = {
  error?: TranslationKey;
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholderKey?: TranslationKey;
  t: Translate;
  value: string;
};

export function CrmSelect({
  error,
  label,
  onChange,
  options,
  placeholderKey = "crm.lead.placeholder.select",
  t,
  value,
}: CrmSelectProps) {
  return (
    <CrmField error={error} label={label} t={t}>
      <select
        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950/70 px-3 text-sm text-white shadow-inner shadow-black/20 outline-none transition hover:border-zinc-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{t(placeholderKey)}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label ?? t(option.translationKey)}
          </option>
        ))}
      </select>
    </CrmField>
  );
}
