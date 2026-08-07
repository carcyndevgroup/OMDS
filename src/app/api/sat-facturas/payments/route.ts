import { NextResponse } from "next/server";

import { parseSatPaymentValues } from "@/features/sat-facturas/schemas/sat-payment-parser";
import { validateSatPayment } from "@/features/sat-facturas/schemas/sat-payment-schema";
import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

export async function GET() {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.listPayments() });
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

  const values = parseSatPaymentValues(body);
  const validation = validateSatPayment(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    { data: await service.createPayment(values) },
    { status: 201 },
  );
}
