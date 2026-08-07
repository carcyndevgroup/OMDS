"use client";

import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useSatFacturas } from "../hooks/use-sat-facturas";
import type { SatFacturaQueueItem, SatFacturaStatus } from "../types/sat-factura";
import { SatFacturaCard } from "./sat-factura-card";

type QueueTab = "active" | "all" | "issued" | "paid";

const tabStatusMap: Record<QueueTab, SatFacturaStatus[] | null> = {
  active: ["pending", "accountant_requested", "sent_to_venue", "partially_paid"],
  all: null,
  issued: ["issued", "sent_to_venue", "partially_paid"],
  paid: ["paid"],
};

export function SatFacturaQueue() {
  const { locale, t } = useTranslation();
  const { facturas, hasError, isLoading } = useSatFacturas();
  const [activeTab, setActiveTab] = useState<QueueTab>("active");
  const filteredFacturas = useFilteredFacturas(facturas, activeTab);
  const counts = useTabCounts(facturas);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        {(["active", "issued", "paid", "all"] as const).map((tab) => (
          <button
            className={`rounded-md px-3 py-2 text-sm font-bold transition ${
              activeTab === tab
                ? "bg-cyan-300 text-zinc-950"
                : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {t(`satFacturas.tab.${tab}`)} ({counts[tab]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          {t("satFacturas.loading")}
        </p>
      ) : null}
      {hasError ? (
        <p className="py-12 text-center text-sm text-rose-300">
          {t("satFacturas.loadError")}
        </p>
      ) : null}
      {!isLoading && !hasError && !filteredFacturas.length ? (
        <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
          {t("satFacturas.empty")}
        </p>
      ) : null}
      <div className="space-y-2">
        {filteredFacturas.map((factura) => (
          <SatFacturaCard factura={factura} key={factura.id} locale={locale} t={t} />
        ))}
      </div>
    </section>
  );
}

function useFilteredFacturas(facturas: SatFacturaQueueItem[], activeTab: QueueTab) {
  return useMemo(() => {
    const statuses = tabStatusMap[activeTab];
    if (!statuses) return facturas;
    return facturas.filter((factura) => statuses.includes(factura.status));
  }, [activeTab, facturas]);
}

function useTabCounts(facturas: SatFacturaQueueItem[]) {
  return useMemo(() => ({
    active: facturas.filter((factura) => tabStatusMap.active?.includes(factura.status)).length,
    all: facturas.length,
    issued: facturas.filter((factura) => tabStatusMap.issued?.includes(factura.status)).length,
    paid: facturas.filter((factura) => factura.status === "paid").length,
  }), [facturas]);
}
