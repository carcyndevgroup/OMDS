"use client";

import { Workflow } from "lucide-react";

import type { TranslationKey } from "@/core/i18n";
import type { Translate } from "@/features/crm/shared/types/form-types";

import type { SatFacturaDetail } from "../types/sat-factura";

type SatFacturaNextStepProps = {
  factura: SatFacturaDetail;
  t: Translate;
};

export function SatFacturaNextStep({ factura, t }: SatFacturaNextStepProps) {
  return (
    <section className="rounded-md border border-cyan-300/30 bg-cyan-300/10 px-5 py-4 shadow-xl shadow-black/20">
      <div className="flex gap-3">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
          <Workflow aria-hidden="true" size={18} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
            {t("satFacturas.next.title")}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-zinc-100">
            {t(getNextStepKey(factura))}
          </p>
        </div>
      </div>
    </section>
  );
}

function getNextStepKey(factura: SatFacturaDetail): TranslationKey {
  if (factura.status === "cancelled") return "satFacturas.next.cancelled";
  if (factura.status === "pending") return "satFacturas.next.pending";
  if (factura.status === "accountant_requested") {
    return "satFacturas.next.accountantRequested";
  }
  if (factura.status === "issued") return "satFacturas.next.issued";
  if (factura.status === "sent_to_venue") return "satFacturas.next.sentToVenue";
  if (factura.status === "partially_paid") return "satFacturas.next.partiallyPaid";
  if (
    factura.complementoStatus === "sent" ||
    factura.complementoStatus === "not_required"
  ) {
    return "satFacturas.next.complete";
  }

  return "satFacturas.next.complemento";
}
