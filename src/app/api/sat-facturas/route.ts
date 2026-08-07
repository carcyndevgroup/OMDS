import { NextResponse } from "next/server";

import { parseSatFacturaValues } from "@/features/sat-facturas/schemas/sat-factura-parser";
import { validateSatFactura } from "@/features/sat-facturas/schemas/sat-factura-schema";
import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

export async function GET() {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
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

  return NextResponse.json(
    { data: await service.createFactura(values) },
    { status: 201 },
  );
}
