"use client";

import { ChefHat, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { useTranslation, type Locale } from "@/core/i18n";
import { createBrowserSupabaseClient } from "@/core/supabase/browser-client";

const locales: Locale[] = ["en", "es"];

export function LoginForm() {
  const router = useRouter();
  const { locale, setLocale, t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasError(false);
    setIsSubmitting(true);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setHasError(true);
      setIsSubmitting(false);
      return;
    }

    router.replace("/crm/leads");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300 text-zinc-950">
            <ChefHat aria-hidden="true" size={22} />
          </span>
          <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-1">
            {locales.map((nextLocale) => (
              <button
                className={[
                  "rounded px-3 py-1.5 text-xs font-bold transition",
                  locale === nextLocale
                    ? "bg-cyan-300 text-zinc-950"
                    : "text-zinc-400 hover:text-white",
                ].join(" ")}
                key={nextLocale}
                onClick={() => setLocale(nextLocale)}
                type="button"
              >
                {t(nextLocale === "en" ? "common.english" : "common.spanish")}
              </button>
            ))}
          </div>
        </div>

        <form
          className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30 sm:p-8"
          onSubmit={handleSubmit}
        >
          <header className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
              {t("brand.shortName")}
            </p>
            <h1 className="text-3xl font-bold">{t("auth.login.title")}</h1>
            <p className="text-sm leading-6 text-zinc-400">
              {t("auth.login.subtitle")}
            </p>
          </header>

          <label className="block space-y-2 text-sm font-semibold text-zinc-300">
            <span>{t("auth.login.email")}</span>
            <input
              autoComplete="email"
              className="h-12 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3.5 text-white outline-none transition focus:border-cyan-300"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-zinc-300">
            <span>{t("auth.login.password")}</span>
            <input
              autoComplete="current-password"
              className="h-12 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3.5 text-white outline-none transition focus:border-cyan-300"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {hasError ? (
            <p className="text-sm font-medium text-rose-300">
              {t("auth.login.error")}
            </p>
          ) : null}

          <button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            <LogIn aria-hidden="true" size={17} />
            {isSubmitting
              ? t("auth.login.signingIn")
              : t("auth.login.signIn")}
          </button>
        </form>
      </div>
    </main>
  );
}
