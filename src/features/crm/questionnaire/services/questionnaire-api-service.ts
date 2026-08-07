import { createServerSupabaseClient } from "@/core/supabase/server-client";
import type { Locale } from "@/core/i18n";

import {
  applyApprovedQuestionnaire,
  createQuestionnaire,
  listQuestionnaires,
  reviewQuestionnaire,
  sendQuestionnaire,
  submitQuestionnaire,
} from "../repositories/questionnaire-repository";

export async function createQuestionnaireApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    applyApproved: (questionnaireId: string, clientId?: string) =>
      applyApprovedQuestionnaire(client, questionnaireId, clientId),
    create: (eventId: string, locale: Locale) =>
      createQuestionnaire(client, eventId, locale),
    list: (eventId: string) => listQuestionnaires(client, eventId),
    review: (
      questionnaireId: string,
      status: "approved" | "rejected",
      notes: string,
    ) => reviewQuestionnaire(client, questionnaireId, status, notes),
    send: (questionnaireId: string) => sendQuestionnaire(client, questionnaireId),
    submit: (questionnaireId: string) => submitQuestionnaire(client, questionnaireId),
  };
}
