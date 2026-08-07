import { NextResponse } from "next/server";

import { createEmailTemplateApiService } from "@/features/settings/email-template/services/email-template-api-service";

type EmailTemplateVersionsRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: EmailTemplateVersionsRouteContext) {
  const params = await props.params;
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const versions = await service.listVersions(params.id);
  return NextResponse.json({ data: versions });
}
