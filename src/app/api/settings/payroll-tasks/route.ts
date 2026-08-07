import { NextResponse } from "next/server";

import { parsePayrollTaskValues } from "@/features/settings/payroll-task/schemas/payroll-task-parser";
import { validatePayrollTask } from "@/features/settings/payroll-task/schemas/payroll-task-schema";
import { createPayrollTaskApiService } from "@/features/settings/payroll-task/services/payroll-task-api-service";

export async function GET() {
  const service = await createPayrollTaskApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createPayrollTaskApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parsePayrollTaskValues(body);
  const validation = validatePayrollTask(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
