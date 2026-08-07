import { NextResponse } from "next/server";

import { parseQuestionnaireTemplateFormValues } from "@/features/settings/questionnaire-template/schemas/questionnaire-template-parser";
import { validateQuestionnaireTemplateForm } from "@/features/settings/questionnaire-template/schemas/questionnaire-template-schema";
import { createQuestionnaireTemplateApiService } from "@/features/settings/questionnaire-template/services/questionnaire-template-api-service";
import {
  DEFAULT_TEMPLATE_DELETE_FORBIDDEN,
  TEMPLATE_IN_USE_DELETE_FORBIDDEN,
} from "@/features/settings/questionnaire-template/repositories/questionnaire-template-repository";

type QuestionnaireTemplateRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: QuestionnaireTemplateRouteContext) {
  const params = await props.params;
  const service = await createQuestionnaireTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const template = await service.find(params.id);
  return template ? NextResponse.json({ data: template }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function PUT(request: Request, props: QuestionnaireTemplateRouteContext) {
  const params = await props.params;
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

  const template = await service.update(params.id, values);
  return template ? NextResponse.json({ data: template }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function PATCH(request: Request, props: QuestionnaireTemplateRouteContext) {
  const params = await props.params;
  const service = await createQuestionnaireTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const isActive =
    typeof body === "object" && body !== null && "isActive" in body
      ? (body as { isActive?: unknown }).isActive
      : undefined;

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }

  const template = await service.setActive(params.id, isActive);
  return template ? NextResponse.json({ data: template }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function DELETE(_: Request, props: QuestionnaireTemplateRouteContext) {
  const params = await props.params;
  const service = await createQuestionnaireTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  try {
    await service.delete(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? (error as { code?: unknown }).code : null;
    if (code === DEFAULT_TEMPLATE_DELETE_FORBIDDEN) {
      return NextResponse.json({ code: DEFAULT_TEMPLATE_DELETE_FORBIDDEN }, { status: 409 });
    }
    if (code === TEMPLATE_IN_USE_DELETE_FORBIDDEN) {
      return NextResponse.json({ code: TEMPLATE_IN_USE_DELETE_FORBIDDEN }, { status: 409 });
    }
    throw error;
  }
}
