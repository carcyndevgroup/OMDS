import { NextResponse } from "next/server";

import { createEventApiService } from "@/features/crm/event/services/event-api-service";

export async function GET() {
  const service = await createEventApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}
