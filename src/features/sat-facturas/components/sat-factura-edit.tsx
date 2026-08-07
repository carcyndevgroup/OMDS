"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import {
  initialSatFacturaValues,
  toSatFacturaValues,
} from "../schemas/sat-factura-schema";
import type { SatFacturaFormValues } from "../types/sat-factura";
import { useSatFactura } from "../hooks/use-sat-factura";
import { SatFacturaForm } from "./sat-factura-form";
import { SatFormShell } from "./sat-form-shell";

type SatFacturaEditProps = {
  facturaId: string;
};

export function SatFacturaEdit({ facturaId }: SatFacturaEditProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const state = useSatFactura(facturaId);

  const save = async (values: SatFacturaFormValues) => {
    const response = await fetch(`/api/sat-facturas/${facturaId}`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    if (!response.ok) throw new Error("sat_factura_update_failed");
  };

  if (state.isLoading) return <Loading text={t("satFacturas.loading")} />;
  if (state.hasError || !state.factura) return <Loading text={t("satFacturas.loadError")} />;

  return (
    <SatFormShell
      subtitle={t("satFacturas.action.back")}
      title={t("satFacturas.edit.title")}
    >
      <SatFacturaForm
        enableEventDefaults={false}
        errorKey="satFacturas.edit.error"
        initialValues={state.factura ? toSatFacturaValues(state.factura) : initialSatFacturaValues}
        onSubmit={save}
        onSuccess={() => router.push(`/sat-facturas/${facturaId}`)}
        submitKey="satFacturas.edit.action.save"
        successKey="satFacturas.edit.success"
      />
    </SatFormShell>
  );
}

function Loading({ text }: { text: string }) {
  return <main className="min-h-screen bg-zinc-950 p-8 text-center text-sm text-zinc-500">{text}</main>;
}
