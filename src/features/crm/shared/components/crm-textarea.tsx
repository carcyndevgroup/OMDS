import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../types/form-types";
import { CrmField } from "./crm-field";

type CrmTextareaProps = {
  error?: TranslationKey;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  t: Translate;
  value: string;
};

export function CrmTextarea({
  error,
  label,
  onChange,
  placeholder,
  t,
  value,
}: CrmTextareaProps) {
  return (
    <CrmField error={error} label={label} t={t}>
      <textarea
        className="min-h-32 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm leading-6 text-white shadow-inner shadow-black/20 outline-none transition placeholder:text-zinc-600 hover:border-zinc-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </CrmField>
  );
}
