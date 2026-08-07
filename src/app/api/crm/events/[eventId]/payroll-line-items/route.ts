import { NextResponse } from "next/server";

import { parseEventPayrollLineItemValues } from "@/features/crm/financials/schemas/event-payroll-line-item-parser";
import { validateEventPayrollLineItem } from "@/features/crm/financials/schemas/event-payroll-line-item-schema";
import { createEventPayrollLineItemApiService } from "@/features/crm/financials/services/event-payroll-line-item-api-service";

type PayrollLineItemRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: PayrollLineItemRouteContext) {
  const service = await createEventPayrollLineItemApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, { params }: PayrollLineItemRouteContext) {
  const service = await createEventPayrollLineItemApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEventPayrollLineItemValues(body);
  const validation = validateEventPayrollLineItem(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    { data: { id: await service.create(params.eventId, values) } },
    { status: 201 },
  );
}
