"use client";

import type { TranslationKey } from "@/core/i18n";
import { useTranslation } from "@/core/i18n";

type ModulePlaceholderPageProps = {
  descriptionKey: TranslationKey;
  titleKey: TranslationKey;
};

export function ModulePlaceholderPage({
  descriptionKey,
  titleKey,
}: ModulePlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white md:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">
            {t("common.comingSoon")}
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t(titleKey)}
          </h1>
          <p className="max-w-3xl text-xl font-bold leading-relaxed text-zinc-500">
            {t(descriptionKey)}
          </p>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/30">
          <p className="text-lg font-bold text-zinc-300">{t("common.comingSoon")}</p>
        </div>
      </section>
    </main>
  );
}
