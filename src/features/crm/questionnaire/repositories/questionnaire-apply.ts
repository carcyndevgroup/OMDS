import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { syncClientPortalAccess } from "../../portal/repositories/client-portal-repository";
import { applyAdditionalClients } from "./questionnaire-apply-additional-clients";
import {
  applyPrimaryClientData,
  resolveSelectedLeadSource,
} from "./questionnaire-apply-client";
import { applyEventAndVenueData } from "./questionnaire-apply-event";
import { applyPlannerPayload } from "./questionnaire-apply-planner";
import { applySecondaryContacts } from "./questionnaire-apply-secondary-contacts";
import {
  createTemplateFieldScope,
  isQuestionnaireReady,
  listTemplateFieldKeys,
  readArray,
  readRecord,
  type QuestionnaireResponseRecord,
} from "./questionnaire-apply-utils";
import { ensureReadyContractForEvent } from "../../contract/repositories/contract-repository";

export async function applyApprovedQuestionnaireData(
  database: SupabaseClient<Database>,
  questionnaireId: string,
  clientId?: string,
) {
  const questionnaireResult = await database
    .from("questionnaires")
    .select("*")
    .eq("id", questionnaireId)
    .maybeSingle();

  if (questionnaireResult.error) throw questionnaireResult.error;
  if (!questionnaireResult.data || !isQuestionnaireReady(questionnaireResult.data)) {
    throw new Error("questionnaire_not_approved");
  }

  const questionnaire = questionnaireResult.data;
  const response = readRecord(questionnaire.response_data);
  const responseParts = getResponseParts(response);

  const templateFieldKeys = await listTemplateFieldKeys(database, questionnaire.template_key);
  const scope = createTemplateFieldScope(templateFieldKeys);

  const eventResult = await database
    .from("events")
    .select("*")
    .eq("id", questionnaire.event_id)
    .maybeSingle();

  if (eventResult.error) throw eventResult.error;
  if (!eventResult.data) throw new Error("questionnaire_event_not_found");

  const primaryContactResult = clientId
    ? await database
      .from("event_contacts")
      .select("client_id")
      .eq("event_id", questionnaire.event_id)
      .eq("client_id", clientId)
      .maybeSingle()
    : await database
    .from("event_contacts")
    .select("client_id")
    .eq("event_id", questionnaire.event_id)
    .order("is_primary", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (primaryContactResult.error) throw primaryContactResult.error;

  const primaryClientId = primaryContactResult.data?.client_id ?? null;
  const selectedLeadSource = await resolveSelectedLeadSource(database, primaryClientId);

  await applyPrimaryClientData(
    database,
    questionnaire.event_id,
    primaryClientId,
    responseParts.clientResponse,
    scope.includesField,
  );

  await applySecondaryContacts(
    database,
    questionnaire.event_id,
    responseParts.additionalResponse,
    scope.includesField,
  );

  await applyEventAndVenueData(
    database,
    eventResult.data,
    questionnaire.event_id,
    responseParts.eventResponse,
    responseParts.venueResponse,
    responseParts.additionalResponse,
    responseParts.assignedContact,
    scope.includesField,
  );

  if (scope.includesField("client.additionalClients")) {
    await applyAdditionalClients(
      database,
      questionnaire.event_id,
      responseParts.additionalClients,
      selectedLeadSource,
    );
  }

  const shouldApplyPlanner = scope.includesAny([
    "planner.company",
    "planner.firstName",
    "planner.lastName",
    "planner.phone",
    "planner.email",
    "planner.instagram",
    "planner.primaryEventContact",
  ]);

  const shouldApplyCoordinator = scope.includesAny([
    "coordinator.company",
    "coordinator.firstName",
    "coordinator.lastName",
    "coordinator.phone",
    "coordinator.email",
    "coordinator.instagram",
    "coordinator.primaryEventContact",
  ]);

  if (shouldApplyPlanner) {
    await applyPlannerPayload(
      database,
      questionnaire.event_id,
      responseParts.plannerResponse,
      "primary_planner",
    );
  }

  if (shouldApplyCoordinator) {
    await applyPlannerPayload(
      database,
      questionnaire.event_id,
      responseParts.coordinatorResponse,
      "day_of_coordinator",
    );
  }

  const appliedResult = await database
    .from("questionnaires")
    .update({
      applied_at: new Date().toISOString(),
      apply_notes: "Applied approved questionnaire data to official booking records.",
    })
    .eq("id", questionnaireId)
    .select("*")
    .single();

  if (appliedResult.error) throw appliedResult.error;

  await ensureReadyContractForEvent(
    database,
    questionnaire.event_id,
    questionnaire.locale === "es" ? "es" : "en",
  );
  await syncClientPortalAccess(database, questionnaire.event_id);
  return appliedResult.data;
}

function getResponseParts(response: QuestionnaireResponseRecord) {
  const clientResponse = readRecord(response.client);
  const eventResponse = readRecord(response.event);
  const venueResponse = readRecord(response.venue);
  const additionalResponse = readRecord(response.additional);
  const plannerResponse = readRecord(response.externalPlanner);
  const coordinatorResponse = readRecord(response.dayOfCoordinator);
  const assignedContact = readRecord(venueResponse.assignedContact);
  const additionalClients = readArray(clientResponse.additionalClients);

  return {
    additionalClients,
    additionalResponse,
    assignedContact,
    clientResponse,
    coordinatorResponse,
    eventResponse,
    plannerResponse,
    venueResponse,
  };
}
