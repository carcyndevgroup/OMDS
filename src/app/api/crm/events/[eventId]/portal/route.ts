import { NextResponse } from "next/server";

import { createClientPortalApiService } from "@/features/crm/portal/services/client-portal-api-service";

type ClientPortalRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: ClientPortalRouteContext) {
  const service = await createClientPortalApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.get(params.eventId) });
}

export async function PATCH(_: Request, { params }: ClientPortalRouteContext) {
  const service = await createClientPortalApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.sync(params.eventId) });
}
