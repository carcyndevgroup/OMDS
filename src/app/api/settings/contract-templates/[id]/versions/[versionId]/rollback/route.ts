import { NextResponse } from "next/server";

import { createContractTemplateApiService } from "@/features/settings/contract-template/services/contract-template-api-service";

type ContractTemplateRollbackRouteContext = { params: { id: string; versionId: string } };

export async function POST(_: Request, { params }: ContractTemplateRollbackRouteContext) {
  const service = await createContractTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const template = await service.rollbackVersion(params.id, params.versionId);
  return template ? NextResponse.json({ data: template }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}
