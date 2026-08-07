import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/core/supabase/admin-client";
import { signContract } from "@/features/crm/contract/repositories/contract-repository";
import { getPublicClientPortalAccess } from "@/features/crm/portal/repositories/client-portal-repository";
import { listPublicPortalContracts } from "@/features/crm/portal/repositories/public-portal-documents-repository";

type ContractRouteContext = {
  params: { accessKey: string; contractId: string };
};

export async function PATCH(request: Request, { params }: ContractRouteContext) {
  const database = createAdminSupabaseClient();
  const portal = await getPublicClientPortalAccess(database, params.accessKey);

  if (!portal || !portal.contractsVisible) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const contracts = await listPublicPortalContracts(database, params.accessKey);
  if (!contracts.some((contract) => contract.contractId === params.contractId)) {
    return NextResponse.json({ code: "contract_not_available" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  if (body?.accepted !== true) {
    return NextResponse.json({ code: "contract_acceptance_required" }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;
  await signContract(database, params.contractId, {
    accepted: true,
    accessKey: params.accessKey,
    consentText: "By checking this box, I acknowledge that I am signing this agreement electronically and that my electronic signature is the legally binding equivalent of my handwritten signature.",
    ipAddress,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });
  return NextResponse.json({ data: true });
}
