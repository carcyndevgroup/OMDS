import { NextResponse } from "next/server";

import { parseQuestionnaireTemplateFormValues } from "@/features/settings/questionnaire-template/schemas/questionnaire-template-parser";
import { validateQuestionnaireTemplateForm } from "@/features/settings/questionnaire-template/schemas/questionnaire-template-schema";
import { createQuestionnaireTemplateApiService } from "@/features/settings/questionnaire-template/services/questionnaire-template-api-service";

export async function GET() {
  const service = await createQuestionnaireTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createQuestionnaireTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseQuestionnaireTemplateFormValues(body);
  const validation = validateQuestionnaireTemplateForm(values);
  if (!validation.isValid) return NextResponse.json({ errors: validation.errors }, { status: 400 });

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
