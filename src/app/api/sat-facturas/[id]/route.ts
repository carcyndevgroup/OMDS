import { NextResponse } from "next/server";

import { parseSatFacturaValues } from "@/features/sat-facturas/schemas/sat-factura-parser";
import { validateSatFactura } from "@/features/sat-facturas/schemas/sat-factura-schema";
import {
  parseWorkflowValues,
  validateWorkflow,
} from "@/features/sat-facturas/schemas/sat-workflow-schema";
import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

type SatFacturaRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: SatFacturaRouteContext) {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const factura = await service.get(params.id);
  if (!factura) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: factura });
}

export async function PUT(request: Request, { params }: SatFacturaRouteContext) {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseSatFacturaValues(body);
  const validation = validateSatFactura(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ data: await service.updateFactura(params.id, values) });
}

export async function PATCH(request: Request, { params }: SatFacturaRouteContext) {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseWorkflowValues(body);
  const validation = validateWorkflow(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const factura = await service.updateFacturaWorkflow(params.id, values);
  if (!factura) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: factura });
}
