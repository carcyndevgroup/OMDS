import { NextResponse } from "next/server";

import { createDashboardApiService } from "@/features/dashboard/services/dashboard-api-service";

export async function GET() {
  const service = await createDashboardApiService();

  if (!service) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    data: await service.listPendingQuestionnaireReviews(),
  });
}
