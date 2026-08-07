import { NextResponse } from "next/server";

import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

type SatFacturaDefaultsRouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_: Request, props: SatFacturaDefaultsRouteContext) {
  const params = await props.params;
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const defaults = await service.getEventDefaults(params.eventId);
  if (!defaults) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: defaults });
}
