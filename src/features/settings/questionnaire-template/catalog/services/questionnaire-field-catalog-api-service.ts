import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createQuestionnaireFieldCatalogItem,
  findQuestionnaireFieldCatalogItem,
  importQuestionnaireFieldCatalogItems,
  listQuestionnaireFieldCatalogItems,
  updateQuestionnaireFieldCatalogItem,
} from "../repositories/questionnaire-field-catalog-repository";
import type { QuestionnaireFieldCatalogFormValues } from "../types/questionnaire-field-catalog";
import { buildDefaultQuestionnaireFieldCatalogValues } from "../utils/questionnaire-field-catalog-defaults";

export async function createQuestionnaireFieldCatalogApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: QuestionnaireFieldCatalogFormValues) => createQuestionnaireFieldCatalogItem(client, values),
    find: (id: string) => findQuestionnaireFieldCatalogItem(client, id),
    importDefaults: () => importQuestionnaireFieldCatalogItems(client, buildDefaultQuestionnaireFieldCatalogValues()),
    list: () => listQuestionnaireFieldCatalogItems(client),
    update: (id: string, values: QuestionnaireFieldCatalogFormValues) => updateQuestionnaireFieldCatalogItem(client, id, values),
  };
}
