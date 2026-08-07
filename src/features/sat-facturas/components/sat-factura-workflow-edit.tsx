"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import {
  toWorkflowValues,
} from "../schemas/sat-workflow-schema";
import type { SatFacturaWorkflowValues } from "../types/sat-factura";
import { useSatFactura } from "../hooks/use-sat-factura";
import { SatFormShell } from "./sat-form-shell";
import { SatFacturaWorkflowForm } from "./sat-factura-workflow-form";

type SatFacturaWorkflowEditProps = {
  facturaId: string;
};

export function SatFacturaWorkflowEdit({ facturaId }: SatFacturaWorkflowEditProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const state = useSatFactura(facturaId);

  const save = async (values: SatFacturaWorkflowValues) => {
    const response = await fetch(`/api/sat-facturas/${facturaId}`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("sat_factura_workflow_failed");
  };

  if (state.isLoading) return <Shell text={t("satFacturas.loading")} />;
  if (state.hasError || !state.factura) return <Shell text={t("satFacturas.loadError")} />;

  return (
    <SatFormShell
      subtitle={t("satFacturas.action.back")}
      title={t("satFacturas.workflow.title")}
    >
      <SatFacturaWorkflowForm
        initialValues={toWorkflowValues(state.factura)}
        onSubmit={save}
        onSuccess={() => router.push(`/sat-facturas/${facturaId}`)}
      />
    </SatFormShell>
  );
}

function Shell({ text }: { text: string }) {
  return <main className="min-h-screen bg-zinc-950 p-8 text-center text-sm text-zinc-500">{text}</main>;
}
