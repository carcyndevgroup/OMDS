import { NextResponse } from "next/server";

import { parseQuestionnaireFieldCatalogFormValues } from "@/features/settings/questionnaire-template/catalog/schemas/questionnaire-field-catalog-parser";
import { validateQuestionnaireFieldCatalogForm } from "@/features/settings/questionnaire-template/catalog/schemas/questionnaire-field-catalog-schema";
import { createQuestionnaireFieldCatalogApiService } from "@/features/settings/questionnaire-template/catalog/services/questionnaire-field-catalog-api-service";

type QuestionnaireFieldCatalogRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: QuestionnaireFieldCatalogRouteContext) {
  const params = await props.params;
  const service = await createQuestionnaireFieldCatalogApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const item = await service.find(params.id);
  return item ? NextResponse.json({ data: item }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function PUT(request: Request, props: QuestionnaireFieldCatalogRouteContext) {
  const params = await props.params;
  const service = await createQuestionnaireFieldCatalogApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseQuestionnaireFieldCatalogFormValues(body);
  const validation = validateQuestionnaireFieldCatalogForm(values);
  if (!validation.isValid) return NextResponse.json({ errors: validation.errors }, { status: 400 });

  const item = await service.update(params.id, values);
  return item ? NextResponse.json({ data: item }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}
