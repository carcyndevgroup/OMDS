import { NextResponse } from "next/server";

import { parseEventCommissionValues } from "@/features/crm/financials/schemas/event-commission-parser";
import { validateEventCommission } from "@/features/crm/financials/schemas/event-commission-schema";
import { createEventCommissionApiService } from "@/features/crm/financials/services/event-commission-api-service";

type EventCommissionRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: EventCommissionRouteContext) {
  const service = await createEventCommissionApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(
  request: Request,
  { params }: EventCommissionRouteContext,
) {
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

  return NextResponse.json(
    { data: { id: await service.create(params.eventId, values) } },
    { status: 201 },
  );
}
