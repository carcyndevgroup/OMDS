"use client";

import { Send, UserRoundCheck, Workflow } from "lucide-react";
import { useMemo, useState } from "react";

import type { TranslationKey } from "@/core/i18n";
import type { Translate } from "@/features/crm/shared/types/form-types";

import { toWorkflowValues } from "../schemas/sat-workflow-schema";
import type {
  SatComplementoAction,
  SatFacturaDetail,
  SatFacturaStatus,
} from "../types/sat-factura";

type SatFacturaQuickActionsProps = {
  factura: SatFacturaDetail;
  onUpdate: (factura: SatFacturaDetail) => void;
  t: Translate;
};

type WorkflowAction = {
  labelKey: TranslationKey;
  status: SatFacturaStatus;
  timestampKey: "accountantRequestedAt" | "sentToVenueAt";
};

type QuickAction =
  | { kind: "workflow"; values: WorkflowAction }
  | { kind: "complemento"; labelKey: TranslationKey; value: SatComplementoAction };

export function SatFacturaQuickActions({
  factura,
  onUpdate,
  t,
}: SatFacturaQuickActionsProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const actions = useMemo(() => buildActions(factura), [factura]);

  if (!actions.length) return null;

  const runAction = async (action: QuickAction) => {
    setStatus("loading");
    try {
      const updated = action.kind === "workflow"
        ? await patchWorkflow(factura, action.values)
        : await patchComplemento(factura.id, action.value);
      onUpdate(updated);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 px-5 py-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
            {t("satFacturas.quick.title")}
          </p>
          <p aria-live="polite" className="mt-1 min-h-5 text-sm font-semibold">
            {status === "success" ? <span className="text-emerald-300">{t("satFacturas.quick.success")}</span> : null}
            {status === "error" ? <span className="text-rose-300">{t("satFacturas.quick.error")}</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/40 px-3 text-sm font-bold text-cyan-200 transition hover:border-cyan-200 disabled:cursor-wait disabled:opacity-60"
              disabled={status === "loading"}
              key={actionKey(action)}
              onClick={() => void runAction(action)}
              type="button"
            >
              {action.kind === "workflow" ? <Send aria-hidden="true" size={16} /> : <Workflow aria-hidden="true" size={16} />}
              {t(action.kind === "workflow" ? action.values.labelKey : action.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function buildActions(factura: SatFacturaDetail): QuickAction[] {
  const actions: QuickAction[] = [];

  if (factura.status === "pending") {
    actions.push({
      kind: "workflow",
      values: {
        labelKey: "satFacturas.quick.requestAccountant",
        status: "accountant_requested",
        timestampKey: "accountantRequestedAt",
      },
    });
  }

  if (factura.status === "issued") {
    actions.push({
      kind: "workflow",
      values: {
        labelKey: "satFacturas.quick.markSent",
        status: "sent_to_venue",
        timestampKey: "sentToVenueAt",
      },
    });
  }

  if (factura.status === "paid" || factura.status === "partially_paid") {
    actions.push(...complementoActions(factura.complementoStatus));
  }

  return actions;
}

function complementoActions(status: string): QuickAction[] {
  if (status === "pending") {
    return [{ kind: "complemento", labelKey: "satFacturas.quick.requestComplemento", value: "requested" }];
  }
  if (status === "requested") {
    return [{ kind: "complemento", labelKey: "satFacturas.quick.receivedComplemento", value: "received" }];
  }
  if (status === "received") {
    return [{ kind: "complemento", labelKey: "satFacturas.quick.sentComplemento", value: "sent" }];
  }

  return [];
}

async function patchWorkflow(factura: SatFacturaDetail, action: WorkflowAction) {
  const values = {
    ...toWorkflowValues(factura),
    [action.timestampKey]: today(),
    status: action.status,
  };
  const response = await fetch(`/api/sat-facturas/${factura.id}`, {
    body: JSON.stringify(values),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });
  if (!response.ok) throw new Error("sat_workflow_quick_action_failed");
  const payload = await response.json() as { data: SatFacturaDetail };
  return payload.data;
}

async function patchComplemento(facturaId: string, action: SatComplementoAction) {
  const response = await fetch(`/api/sat-facturas/${facturaId}/complemento`, {
    body: JSON.stringify({ action }),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });
  if (!response.ok) throw new Error("sat_complemento_quick_action_failed");
  const payload = await response.json() as { data: SatFacturaDetail };
  return payload.data;
}

function actionKey(action: QuickAction) {
  return action.kind === "workflow" ? action.values.status : action.value;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
