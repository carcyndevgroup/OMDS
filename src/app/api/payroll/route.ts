import { NextResponse } from "next/server";

import { createPayrollApiService } from "@/features/payroll/services/payroll-api-service";

export async function GET() {
  const service = await createPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.listDashboard() });
}
