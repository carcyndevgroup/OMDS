import { NextResponse } from "next/server";

import { parseEventPayrollLineItemValues } from "@/features/crm/financials/schemas/event-payroll-line-item-parser";
import { validateEventPayrollLineItem } from "@/features/crm/financials/schemas/event-payroll-line-item-schema";
import { createEventPayrollLineItemApiService } from "@/features/crm/financials/services/event-payroll-line-item-api-service";

type PayrollLineItemRouteContext = {
  params: Promise<{ eventId: string; lineItemId: string }>;
};

export async function DELETE(_: Request, props: PayrollLineItemRouteContext) {
  const params = await props.params;
  const service = await createEventPayrollLineItemApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.lineItemId);
  return NextResponse.json({ data: true });
}

export async function PATCH(_: Request, props: PayrollLineItemRouteContext) {
  const params = await props.params;
  const service = await createEventPayrollLineItemApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const id = await service.approve(params.eventId, params.lineItemId);
  if (!id) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: { id } });
}

export async function PUT(request: Request, props: PayrollLineItemRouteContext) {
  const params = await props.params;
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

  const id = await service.update(params.eventId, params.lineItemId, values);
  if (!id) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: { id } });
}
