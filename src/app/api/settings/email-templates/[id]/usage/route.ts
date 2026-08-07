import { NextResponse } from "next/server";

import { createEmailTemplateApiService } from "@/features/settings/email-template/services/email-template-api-service";

type EmailTemplateUsageRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: EmailTemplateUsageRouteContext) {
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const usage = await service.getUsageSummary(params.id);
  return usage
    ? NextResponse.json({ data: usage })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}
