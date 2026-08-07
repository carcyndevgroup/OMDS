import type { SupabaseClient } from "@supabase/supabase-js";

import type { Locale } from "@/core/i18n";
import type { Database } from "@/core/supabase/database.types";

import { syncClientPortalAccess } from "../../portal/repositories/client-portal-repository";
import { applyApprovedQuestionnaireData } from "./questionnaire-apply";
import type {
  Questionnaire,
  QuestionnaireReviewStatus,
  QuestionnaireStatus,
} from "../types/questionnaire";

type QuestionnaireRow = Database["public"]["Tables"]["questionnaires"]["Row"];

const mapQuestionnaire = (row: QuestionnaireRow): Questionnaire => ({
  appliedAt: row.applied_at,
  applyNotes: row.apply_notes,
  createdAt: row.created_at,
  eventId: row.event_id,
  id: row.id,
  internalChangeNotes: row.internal_change_notes,
  locale: row.locale === "es" ? "es" : "en",
  responseData: row.response_data,
  reviewNotes: row.review_notes,
  reviewStatus: row.review_status as QuestionnaireReviewStatus,
  reviewedAt: row.reviewed_at,
  sentAt: row.sent_at,
  status: row.status as QuestionnaireStatus,
  submittedAt: row.submitted_at,
  templateKey: row.template_key,
  title: row.title,
  updatedAt: row.updated_at,
});

export async function createQuestionnaire(
  database: SupabaseClient<Database>,
  eventId: string,
  locale: Locale,
) {
  const templateKey = await resolveQuestionnaireTemplateKeyForEvent(database, eventId);
  const result = await database
    .from("questionnaires")
    .insert({
      event_id: eventId,
      locale,
      template_key: templateKey,
    })
    .select("*")
    .single();

  if (!result.error) return mapQuestionnaire(result.data);

  // Unique (event_id, template_key) means create should be idempotent for this template.
  if (result.error.code === "23505") {
    const existing = await database
      .from("questionnaires")
      .select("*")
      .eq("event_id", eventId)
      .eq("template_key", templateKey)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing.error) throw existing.error;
    if (existing.data) return mapQuestionnaire(existing.data);
  }

  throw result.error;
}

async function resolveQuestionnaireTemplateKeyForEvent(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const acceptedQuoteResult = await database
    .from("quotes")
    .select("accepted_version_id,status")
    .eq("event_id", eventId)
    .eq("status", "accepted")
    .not("accepted_version_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (acceptedQuoteResult.error) throw acceptedQuoteResult.error;

  const acceptedVersionId = acceptedQuoteResult.data?.accepted_version_id;
  if (acceptedVersionId) {
    const acceptedVersionResult = await database
      .from("quote_versions")
      .select("questionnaire_template_key")
      .eq("id", acceptedVersionId)
      .maybeSingle();

    if (acceptedVersionResult.error) throw acceptedVersionResult.error;
    if (acceptedVersionResult.data?.questionnaire_template_key) {
      return acceptedVersionResult.data.questionnaire_template_key;
    }
  }

  const latestQuoteResult = await database
    .from("quotes")
    .select("id")
    .eq("event_id", eventId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestQuoteResult.error) throw latestQuoteResult.error;

  const latestQuoteId = latestQuoteResult.data?.id;
  if (!latestQuoteId) return fallbackTemplateKeyForEvent(database, eventId);

  const latestVersionResult = await database
    .from("quote_versions")
    .select("questionnaire_template_key")
    .eq("quote_id", latestQuoteId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestVersionResult.error) throw latestVersionResult.error;

  if (latestVersionResult.data?.questionnaire_template_key) {
    return latestVersionResult.data.questionnaire_template_key;
  }

  return fallbackTemplateKeyForEvent(database, eventId);
}

async function fallbackTemplateKeyForEvent(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const event = await database
    .from("events")
    .select("booking_type,event_type")
    .eq("id", eventId)
    .maybeSingle();

  if (event.error) throw event.error;

  const templates = await database
    .from("questionnaire_templates")
    .select("template_key,booking_type,event_type,is_default,is_active,title")
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("title");

  if (templates.error) throw templates.error;

  const bookingType = event.data?.booking_type ?? null;
  const eventType = event.data?.event_type ?? null;
  const matchingTemplates = templates.data.filter((template) => {
    const matchesBookingType = !template.booking_type || template.booking_type === bookingType;
    const matchesEventType = !template.event_type || template.event_type === eventType;
    return matchesBookingType && matchesEventType;
  });

  return matchingTemplates[0]?.template_key ?? templates.data[0]?.template_key ?? null;
}

export async function listQuestionnaires(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const result = await database
    .from("questionnaires")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (result.error) throw result.error;
  return result.data.map(mapQuestionnaire);
}

export async function sendQuestionnaire(
  database: SupabaseClient<Database>,
  questionnaireId: string,
) {
  const result = await database
    .from("questionnaires")
    .update({ sent_at: new Date().toISOString(), status: "sent" })
    .eq("id", questionnaireId)
    .select("event_id")
    .single();

  if (result.error) throw result.error;
  await syncClientPortalAccess(database, result.data.event_id);
}

export async function submitQuestionnaire(
  database: SupabaseClient<Database>,
  questionnaireId: string,
) {
  const result = await database
    .from("questionnaires")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", questionnaireId)
    .select("event_id")
    .single();

  if (result.error) throw result.error;
  await syncClientPortalAccess(database, result.data.event_id);
}

export async function reviewQuestionnaire(
  database: SupabaseClient<Database>,
  questionnaireId: string,
  reviewStatus: "approved" | "rejected",
  reviewNotes: string,
) {
  const result = await database
    .from("questionnaires")
    .update({
      review_notes: reviewNotes,
      review_status: reviewStatus,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", questionnaireId)
    .select("*")
    .single();

  if (result.error) throw result.error;
  return mapQuestionnaire(result.data);
}

export async function applyApprovedQuestionnaire(
  database: SupabaseClient<Database>,
  questionnaireId: string,
  clientId?: string,
) {
  const questionnaire = await applyApprovedQuestionnaireData(database, questionnaireId, clientId);
  return mapQuestionnaire(questionnaire);
}
