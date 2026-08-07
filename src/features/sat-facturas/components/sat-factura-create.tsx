"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { initialSatFacturaValues } from "../schemas/sat-factura-schema";
import type { SatFacturaFormValues } from "../types/sat-factura";
import { SatFacturaForm } from "./sat-factura-form";
import { SatFormShell } from "./sat-form-shell";

export function SatFacturaCreate() {
  const router = useRouter();
  const { t } = useTranslation();

  const save = async (values: SatFacturaFormValues) => {
    const response = await fetch("/api/sat-facturas", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) throw new Error("sat_factura_create_failed");
  };

  return (
    <SatFormShell
      subtitle={t("satFacturas.action.back")}
      title={t("satFacturas.new.title")}
    >
      <SatFacturaForm
        errorKey="satFacturas.new.error"
        initialValues={initialSatFacturaValues}
        onSubmit={save}
        onSuccess={() => router.push("/sat-facturas")}
        submitKey="satFacturas.new.action.create"
        successKey="satFacturas.new.success"
      />
    </SatFormShell>
  );
}
