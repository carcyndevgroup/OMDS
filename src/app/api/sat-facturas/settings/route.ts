import { NextResponse } from "next/server";

import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

export async function GET() {
  const service = await createSatFacturaApiService();
  if (!service) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: await service.settings() });
}
