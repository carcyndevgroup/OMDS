import { NextResponse } from "next/server";

import { parseEventStaffPayrollValues } from "@/features/crm/financials/schemas/event-staff-payroll-parser";
import { validateEventStaffPayroll } from "@/features/crm/financials/schemas/event-staff-payroll-schema";
import { createEventStaffPayrollApiService } from "@/features/crm/financials/services/event-staff-payroll-api-service";

type EventStaffPayrollRouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_: Request, props: EventStaffPayrollRouteContext) {
  const params = await props.params;
  const service = await createEventStaffPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, props: EventStaffPayrollRouteContext) {
  const params = await props.params;
  const service = await createEventStaffPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEventStaffPayrollValues(body);
  const validation = validateEventStaffPayroll(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    { data: { id: await service.upsert(params.eventId, values) } },
    { status: 201 },
  );
}
