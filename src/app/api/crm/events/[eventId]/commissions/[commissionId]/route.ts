import { NextResponse } from "next/server";

import { parseEventCommissionValues } from "@/features/crm/financials/schemas/event-commission-parser";
import { validateEventCommission } from "@/features/crm/financials/schemas/event-commission-schema";
import { createEventCommissionApiService } from "@/features/crm/financials/services/event-commission-api-service";

type EventCommissionItemRouteContext = {
  params: Promise<{ commissionId: string; eventId: string }>;
};

export async function PATCH(request: Request, props: EventCommissionItemRouteContext) {
  const params = await props.params;
  const service = await createEventCommissionApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEventCommissionValues(body);
  const validation = validateEventCommission(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({
    data: await service.update(params.eventId, params.commissionId, values),
  });
}

export async function DELETE(_: Request, props: EventCommissionItemRouteContext) {
  const params = await props.params;
  const service = await createEventCommissionApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.commissionId);
  return NextResponse.json({ data: true });
}
