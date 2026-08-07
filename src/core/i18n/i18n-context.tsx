"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "en" | "es";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LANGUAGE_STORAGE_KEY = "omds.locale";
const DEFAULT_LOCALE: Locale = "en";

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const isLocale = (value: string | null): value is Locale => {
  return value === "en" || value === "es";
};

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (isLocale(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "es" : "en");
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }

  return context;
}
