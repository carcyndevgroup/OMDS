import { NextResponse } from "next/server";

import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const payment = await service.getPayment(params.id);
  if (!payment) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: payment });
}
