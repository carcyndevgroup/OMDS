import { NextResponse } from "next/server";

import { parseContractTemplateFormValues } from "@/features/settings/contract-template/schemas/contract-template-parser";
import { validateContractTemplateForm } from "@/features/settings/contract-template/schemas/contract-template-schema";
import { createContractTemplateApiService } from "@/features/settings/contract-template/services/contract-template-api-service";

export async function GET() {
  const service = await createContractTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createContractTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseContractTemplateFormValues(body);
  const validation = validateContractTemplateForm(values);
  if (!validation.isValid) return NextResponse.json({ errors: validation.errors }, { status: 400 });

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
