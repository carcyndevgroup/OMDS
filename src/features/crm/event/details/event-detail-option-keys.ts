import type { TranslationKey } from "@/core/i18n";

export const findOptionKey = <TValue extends string>(
  options: { translationKey: TranslationKey; value: TValue }[],
  value: TValue,
) => options.find((option) => option.value === value)?.translationKey;

export const powerSupplyKey = (value: string) => {
  if (value === "yes") return "public.questionnaire.option.yes";
  if (value === "no") return "public.questionnaire.option.no";
  if (value === "not_sure") return "public.questionnaire.option.notSure";
  return null;
};
