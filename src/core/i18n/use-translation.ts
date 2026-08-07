import { useCallback } from "react";

import { useLanguage } from "./i18n-context";
import { translations, type TranslationKey } from "./translations";

export function useTranslation() {
  const { locale, setLocale, toggleLocale } = useLanguage();

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[locale][key];
    },
    [locale],
  );

  return {
    locale,
    setLocale,
    t,
    toggleLocale,
  };
}
