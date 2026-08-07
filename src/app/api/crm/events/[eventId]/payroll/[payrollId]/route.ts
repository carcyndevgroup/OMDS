import { NextResponse } from "next/server";

import { createEventStaffPayrollApiService } from "@/features/crm/financials/services/event-staff-payroll-api-service";

type EventStaffPayrollItemRouteContext = {
  params: { eventId: string; payrollId: string };
};

export async function DELETE(
  _: Request,
  { params }: EventStaffPayrollItemRouteContext,
) {
  const service = await createEventStaffPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.payrollId);
  return NextResponse.json({ data: true });
}
