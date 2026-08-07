import { NextResponse } from "next/server";

import { createContractApiService } from "@/features/crm/contract/services/contract-api-service";
import type { ContractAction } from "@/features/crm/contract/types/contract";
import { recordClientEventActivity } from "@/features/crm/shared/services/record-client-activity";

type ContractRouteContext = {
  params: { contractId: string; eventId: string };
};

const actions = new Set<ContractAction>(["send", "sign", "void"]);

export async function PATCH(request: Request, { params }: ContractRouteContext) {
  const service = await createContractApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const action =
    body && typeof body === "object"
      ? (body as { action?: unknown }).action
      : null;

  if (typeof action !== "string" || !actions.has(action as ContractAction)) {
    return NextResponse.json({ code: "invalid_action" }, { status: 400 });
  }

  if (action === "send") await service.send(params.contractId);
  if (action === "sign") await service.sign(params.contractId);
  if (action === "void") await service.void(params.contractId);

  await recordClientEventActivity(
    params.eventId,
    `contract_${action}`,
    `Contract ${action}`,
  );

  return NextResponse.json({ data: true });
}
