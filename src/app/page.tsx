"use client";

import { useTranslation, type Locale } from "@/core/i18n";

const locales: Locale[] = ["en", "es"];

export default function HomePage() {
  const { locale, setLocale, t, toggleLocale } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl shadow-cyan-950/30">
          <div className="border-b border-white/10 bg-white/[0.03] px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                {t("brand.shortName")}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                  {t("common.language")}
                </span>

                <div className="flex rounded-md border border-white/10 bg-black/30 p-1">
                  {locales.map((nextLocale) => {
                    const isActive = nextLocale === locale;

                    return (
                      <button
                        className={[
                          "rounded px-3 py-1.5 text-sm font-semibold transition",
                          isActive
                            ? "bg-cyan-300 text-zinc-950"
                            : "text-zinc-300 hover:bg-white/10 hover:text-white",
                        ].join(" ")}
                        key={nextLocale}
                        onClick={() => setLocale(nextLocale)}
                        type="button"
                      >
                        {t(
                          nextLocale === "en"
                            ? "common.english"
                            : "common.spanish",
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-6 py-12 sm:px-10">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                {t("brand.name")}
              </h1>
              <p className="text-xl font-semibold text-cyan-100">
                {t("hero.title")}
              </p>
              <p className="max-w-xl text-base leading-7 text-zinc-300">
                {t("hero.subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-md bg-cyan-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
                type="button"
              >
                {t("hero.cta")}
              </button>
              <button
                className="rounded-md border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                onClick={toggleLocale}
                type="button"
              >
                {t("common.language")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
