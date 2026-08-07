import { NextResponse } from "next/server";

import type { Locale } from "@/core/i18n";
import { createQuestionnaireApiService } from "@/features/crm/questionnaire/services/questionnaire-api-service";

type QuestionnairesRouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_: Request, props: QuestionnairesRouteContext) {
  const params = await props.params;
  const service = await createQuestionnaireApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, props: QuestionnairesRouteContext) {
  const params = await props.params;
  const service = await createQuestionnaireApiService();
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

  return NextResponse.json(
    { data: await service.create(params.eventId, locale as Locale) },
    { status: 201 },
  );
}
