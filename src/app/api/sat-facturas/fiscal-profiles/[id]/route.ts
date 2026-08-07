import { NextResponse } from "next/server";

import { parseFiscalProfileValues } from "@/features/sat-facturas/schemas/sat-settings-parser";
import { validateFiscalProfile } from "@/features/sat-facturas/schemas/sat-settings-schema";
import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

type FiscalProfileRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: FiscalProfileRouteContext) {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const data = await service.findFiscalProfile(params.id);
  if (!data) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PUT(request: Request, { params }: FiscalProfileRouteContext) {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseFiscalProfileValues(body);
  const validation = validateFiscalProfile(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const data = await service.updateFiscalProfile(params.id, values);
  if (!data) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data });
}
