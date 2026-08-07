import { NextResponse } from "next/server";

import { parseQuestionnaireFieldCatalogFormValues } from "@/features/settings/questionnaire-template/catalog/schemas/questionnaire-field-catalog-parser";
import { validateQuestionnaireFieldCatalogForm } from "@/features/settings/questionnaire-template/catalog/schemas/questionnaire-field-catalog-schema";
import { createQuestionnaireFieldCatalogApiService } from "@/features/settings/questionnaire-template/catalog/services/questionnaire-field-catalog-api-service";

export async function GET() {
  const service = await createQuestionnaireFieldCatalogApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createQuestionnaireFieldCatalogApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  if (body && typeof body === "object" && "action" in body && (body as { action?: string }).action === "import_defaults") {
    return NextResponse.json({ data: await service.importDefaults() }, { status: 200 });
  }

  const values = parseQuestionnaireFieldCatalogFormValues(body);
  const validation = validateQuestionnaireFieldCatalogForm(values);
  if (!validation.isValid) return NextResponse.json({ errors: validation.errors }, { status: 400 });

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
