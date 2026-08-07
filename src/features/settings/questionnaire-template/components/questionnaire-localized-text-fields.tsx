"use client";

import type { Translate } from "@/features/crm/shared/types/form-types";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";

import type { LocalizedText } from "../utils/questionnaire-definition";

type QuestionnaireLocalizedTextFieldsProps = {
  label: string;
  multiline?: boolean;
  onChange: (value: LocalizedText) => void;
  placeholder?: string;
  t: Translate;
  value: LocalizedText;
};

export function QuestionnaireLocalizedTextFields({
  label,
  multiline = false,
  onChange,
  placeholder,
  t,
  value,
}: QuestionnaireLocalizedTextFieldsProps) {
  const englishLabel = `${label} (${t("common.english")})`;
  const spanishLabel = `${label} (${t("common.spanish")})`;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {multiline ? (
        <CrmTextarea
          label={englishLabel}
          onChange={(nextValue) => onChange({ ...value, en: nextValue })}
          placeholder={placeholder ?? ""}
          t={t}
          value={value.en}
        />
      ) : (
        <CrmTextInput
          label={englishLabel}
          onChange={(nextValue) => onChange({ ...value, en: nextValue })}
          placeholder={placeholder}
          t={t}
          value={value.en}
        />
      )}
      {multiline ? (
        <CrmTextarea
          label={spanishLabel}
          onChange={(nextValue) => onChange({ ...value, es: nextValue })}
          placeholder={placeholder ?? ""}
          t={t}
          value={value.es}
        />
      ) : (
        <CrmTextInput
          label={spanishLabel}
          onChange={(nextValue) => onChange({ ...value, es: nextValue })}
          placeholder={placeholder}
          t={t}
          value={value.es}
        />
      )}
    </div>
  );
}