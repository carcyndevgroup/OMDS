"use client";

import Link from "next/link";

import { useTranslation } from "@/core/i18n";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center text-zinc-100">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">404</p>
        <h1 className="mt-3 text-2xl font-bold">{t("common.pageNotFound")}</h1>
        <Link className="mt-6 inline-block rounded-md bg-cyan-300 px-4 py-2 text-sm font-bold text-zinc-950" href="/">
          {t("nav.home")}
        </Link>
      </div>
    </main>
  );
}
