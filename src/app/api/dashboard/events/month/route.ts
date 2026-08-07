import { NextRequest, NextResponse } from "next/server";

import { createDashboardApiService } from "@/features/dashboard/services/dashboard-api-service";

const monthPattern = /^\d{4}-\d{2}$/;

export async function GET(request: NextRequest) {
  const service = await createDashboardApiService();

  if (!service) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const requestedMonth = request.nextUrl.searchParams.get("month");
  const includeUnconfirmed =
    request.nextUrl.searchParams.get("includeUnconfirmed") === "true";
  const month = requestedMonth && monthPattern.test(requestedMonth)
    ? requestedMonth
    : getCurrentCancunMonth();

  return NextResponse.json({
    data: await service.listDashboardMonthEvents(month, includeUnconfirmed),
  });
}

function getCurrentCancunMonth() {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    timeZone: "America/Cancun",
    year: "numeric",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";

  return `${year}-${month}`;
}
