import { NextResponse } from "next/server";

import { createEmailTemplateApiService } from "@/features/settings/email-template/services/email-template-api-service";

type EmailTemplateUsageRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: EmailTemplateUsageRouteContext) {
  const params = await props.params;
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const usage = await service.getUsageSummary(params.id);
  return usage
    ? NextResponse.json({ data: usage })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}
