"use client";

import type { ReactNode } from "react";

import { LanguageProvider } from "@/core/i18n";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
