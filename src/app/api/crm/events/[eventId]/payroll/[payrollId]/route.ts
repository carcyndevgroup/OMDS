import { NextResponse } from "next/server";

import { createEventStaffPayrollApiService } from "@/features/crm/financials/services/event-staff-payroll-api-service";

type EventStaffPayrollItemRouteContext = {
  params: Promise<{ eventId: string; payrollId: string }>;
};

export async function DELETE(_: Request, props: EventStaffPayrollItemRouteContext) {
  const params = await props.params;
  const service = await createEventStaffPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.payrollId);
  return NextResponse.json({ data: true });
}
