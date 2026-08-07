import { NextResponse } from "next/server";

import { createEmailTemplateApiService } from "@/features/settings/email-template/services/email-template-api-service";

type EmailTemplateRollbackRouteContext = { params: Promise<{ id: string; versionId: string }> };

export async function POST(_: Request, props: EmailTemplateRollbackRouteContext) {
  const params = await props.params;
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const template = await service.rollbackVersion(params.id, params.versionId);
  return template ? NextResponse.json({ data: template }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}
