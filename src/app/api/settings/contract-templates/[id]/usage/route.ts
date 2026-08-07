import { NextResponse } from "next/server";

import { createContractTemplateApiService } from "@/features/settings/contract-template/services/contract-template-api-service";

type ContractTemplateUsageRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: ContractTemplateUsageRouteContext) {
  const params = await props.params;
  const service = await createContractTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const usage = await service.getUsageSummary(params.id);
  return usage
    ? NextResponse.json({ data: usage })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}
