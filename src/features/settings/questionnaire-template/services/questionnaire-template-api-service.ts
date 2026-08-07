import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { QuestionnaireTemplateFormValues } from "../types/questionnaire-template";
import {
  createQuestionnaireTemplate,
  deleteQuestionnaireTemplate,
  findQuestionnaireTemplate,
  listQuestionnaireTemplates,
  setQuestionnaireTemplateActive,
  updateQuestionnaireTemplate,
} from "../repositories/questionnaire-template-repository";

export async function createQuestionnaireTemplateApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: QuestionnaireTemplateFormValues) => createQuestionnaireTemplate(client, values),
    delete: (id: string) => deleteQuestionnaireTemplate(client, id),
    find: (id: string) => findQuestionnaireTemplate(client, id),
    list: () => listQuestionnaireTemplates(client),
    setActive: (id: string, isActive: boolean) => setQuestionnaireTemplateActive(client, id, isActive),
    update: (id: string, values: QuestionnaireTemplateFormValues) => updateQuestionnaireTemplate(client, id, values),
  };
}
