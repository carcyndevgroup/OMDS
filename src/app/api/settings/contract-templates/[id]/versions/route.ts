import { NextResponse } from "next/server";

import { createContractTemplateApiService } from "@/features/settings/contract-template/services/contract-template-api-service";

type ContractTemplateVersionsRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: ContractTemplateVersionsRouteContext) {
  const service = await createContractTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const versions = await service.listVersions(params.id);
  return NextResponse.json({ data: versions });
}
