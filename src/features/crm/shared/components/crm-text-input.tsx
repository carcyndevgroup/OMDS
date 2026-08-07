import type { HTMLInputTypeAttribute } from "react";

import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../types/form-types";
import { CrmField } from "./crm-field";

type CrmTextInputProps = {
  disabled?: boolean;
  error?: TranslationKey;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  t: Translate;
  type?: HTMLInputTypeAttribute;
  value: string;
};

export function CrmTextInput({
  disabled = false,
  error,
  label,
  onChange,
  placeholder,
  t,
  type = "text",
  value,
}: CrmTextInputProps) {
  return (
    <CrmField error={error} label={label} t={t}>
      <input
        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950/70 px-3 text-sm text-white shadow-inner shadow-black/20 outline-none transition [color-scheme:dark] hover:border-zinc-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </CrmField>
  );
}
