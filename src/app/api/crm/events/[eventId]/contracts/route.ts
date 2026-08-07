import { NextResponse } from "next/server";

import type { Locale } from "@/core/i18n";
import { createContractApiService } from "@/features/crm/contract/services/contract-api-service";
import { recordClientEventActivity } from "@/features/crm/shared/services/record-client-activity";

type ContractsRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: ContractsRouteContext) {
  const service = await createContractApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, { params }: ContractsRouteContext) {
  const service = await createContractApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const locale =
    body && typeof body === "object" && (body as { locale?: unknown }).locale === "es"
      ? "es"
      : "en";

  const created = await service.create(params.eventId, locale as Locale);
  await recordClientEventActivity(params.eventId, "contract_created", "Contract created");
  return NextResponse.json({ data: created }, { status: 201 });
}
