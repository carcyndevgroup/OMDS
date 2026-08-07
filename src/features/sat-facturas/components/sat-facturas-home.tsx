"use client";

import { CircleDollarSign, CreditCard, Plus, Settings } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { SatFacturaQueue } from "./sat-factura-queue";

export function SatFacturasHome() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {t("satFacturas.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-base font-medium text-zinc-500">
              {t("satFacturas.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950"
              href="/sat-facturas/new"
            >
              <Plus aria-hidden="true" size={18} />
              {t("satFacturas.action.add")}
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-cyan-300/40 px-4 text-sm font-bold text-cyan-200 hover:border-cyan-200"
              href="/sat-facturas/payments/new"
            >
              <CircleDollarSign aria-hidden="true" size={18} />
              {t("satFacturas.action.registerPayment")}
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 hover:border-cyan-300 hover:text-cyan-200"
              href="/sat-facturas/payments"
            >
              <CreditCard aria-hidden="true" size={18} />
              {t("satPayments.action.history")}
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 hover:border-cyan-300 hover:text-cyan-200"
              href="/sat-facturas/settings"
            >
              <Settings aria-hidden="true" size={18} />
              {t("satFacturas.action.settings")}
            </Link>
          </div>
        </header>

        <SatFacturaQueue />
      </div>
    </main>
  );
}
