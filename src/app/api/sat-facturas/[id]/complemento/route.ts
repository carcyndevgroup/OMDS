import { NextResponse } from "next/server";

import type { SatComplementoAction } from "@/features/sat-facturas/types/sat-factura";
import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

const actions = new Set(["received", "requested", "sent"]);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const action = getAction(body);
  if (!action) return NextResponse.json({ code: "invalid_action" }, { status: 400 });

  const factura = await service.updateFacturaComplemento(params.id, action);
  if (!factura) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: factura });
}

function getAction(input: unknown): SatComplementoAction | null {
  if (!input || typeof input !== "object") return null;
  const action = (input as { action?: unknown }).action;
  return typeof action === "string" && actions.has(action)
    ? action as SatComplementoAction
    : null;
}
