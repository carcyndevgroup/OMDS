import { NextResponse } from "next/server";

import { createEmailTemplateApiService } from "@/features/settings/email-template/services/email-template-api-service";

type EmailTemplateVersionsRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: EmailTemplateVersionsRouteContext) {
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const versions = await service.listVersions(params.id);
  return NextResponse.json({ data: versions });
}
