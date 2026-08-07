import type { TranslationKey } from "@/core/i18n";
import type { Json } from "@/core/supabase/json.types";

import type { ClientDetail } from "../../client/types/client";
import { formatPhone } from "../../shared/utils/phone-format";

type QuestionnaireApplyDiffProps = {
  client: ClientDetail;
  responseData: Json;
  t: (key: TranslationKey) => string;
};

type DiffRow = {
  current: string;
  id: string;
  labelKey: TranslationKey;
  sectionKey: TranslationKey;
  submitted: string;
};

const emptyValue = "common.notProvided";

export function QuestionnaireApplyDiff(props: QuestionnaireApplyDiffProps) {
  const { client, responseData, t } = props;
  const rows = buildRows(client, responseData).filter((row) => row.submitted);
  const sections = Array.from(new Set(rows.map((row) => row.sectionKey)));

  return (
    <div className="space-y-4 rounded-md border border-cyan-300/20 bg-cyan-300/5 p-4">
      <div>
        <h4 className="text-sm font-black uppercase tracking-wide text-cyan-200">
          {t("crm.questionnaire.diff.title")}
        </h4>
        <p className="mt-2 text-sm text-zinc-500">
          {t("crm.questionnaire.diff.description")}
        </p>
      </div>
      {rows.length ? (
        sections.map((sectionKey) => (
          <section className="rounded-md border border-zinc-800 p-4" key={sectionKey}>
            <h5 className="font-bold text-cyan-200">{t(sectionKey)}</h5>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[38rem] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="py-2 pr-4">{t("crm.questionnaire.diff.field")}</th>
                    <th className="py-2 pr-4">{t("crm.questionnaire.diff.current")}</th>
                    <th className="py-2">{t("crm.questionnaire.diff.submitted")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rows.filter((row) => row.sectionKey === sectionKey).map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-bold text-zinc-300">{t(row.labelKey)}</td>
                      <td className="py-3 pr-4 text-zinc-500">{row.current || t(emptyValue)}</td>
                      <td className="py-3 text-zinc-100">{row.submitted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      ) : (
        <p className="rounded-md border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
          {t("crm.questionnaire.diff.empty")}
        </p>
      )}
    </div>
  );
}

function buildRows(client: ClientDetail, responseData: Json): DiffRow[] {
  const root = asRecord(responseData);
  const clientResponse = asRecord(root.client);
  const additionalClients = asArray(clientResponse.additionalClients);
  const eventResponse = asRecord(root.event);
  const venueResponse = asRecord(root.venue);
  const additionalResponse = asRecord(root.additional);
  const coordinatorResponse = asRecord(root.dayOfCoordinator);
  const plannerResponse = asRecord(root.externalPlanner);
  const assignedContact = asRecord(venueResponse.assignedContact);
  const event = client.event;

  if (!event) return [];

  return [
    row("public.questionnaire.section.client", "public.questionnaire.field.legalFirstName", client.legalFirstName, clientResponse.legalFirstName),
    row("public.questionnaire.section.client", "public.questionnaire.field.legalLastName", client.legalLastName, clientResponse.legalLastName),
    phoneRow("public.questionnaire.section.client", "public.questionnaire.field.phone", client.phone, clientResponse.phone),
    row("public.questionnaire.section.client", "public.questionnaire.field.instagram", client.instagram, clientResponse.instagram),
    row("public.questionnaire.section.client", "public.questionnaire.field.facebook", client.facebook, clientResponse.facebook),
    row("public.questionnaire.section.client", "public.questionnaire.field.preferredCommunication", client.preferredCommunicationMethod, clientResponse.preferredCommunicationMethod),
    row("public.questionnaire.section.event", "public.questionnaire.field.eventName", event.eventName, eventResponse.eventName),
    row("public.questionnaire.section.event", "public.questionnaire.field.marqueeNames", event.marqueeSignNames, eventResponse.marqueeNames),
    row("public.questionnaire.section.event", "public.questionnaire.field.eventHashtags", event.eventHashtags, eventResponse.eventHashtags),
    row("public.questionnaire.section.event", "public.questionnaire.field.serviceStartTime", event.serviceStartTime ?? "", eventResponse.serviceStartTime),
    row("public.questionnaire.section.event", "public.questionnaire.field.serviceEndTime", event.serviceEndTime ?? "", eventResponse.serviceEndTime),
    row("public.questionnaire.section.venue", "public.questionnaire.field.venueContactName", event.eventVenueContactName, assignedContact.name),
    row("public.questionnaire.section.venue", "public.questionnaire.field.venueContactRole", event.eventVenueContactRole, assignedContact.role),
    phoneRow("public.questionnaire.section.venue", "public.questionnaire.field.phone", event.eventVenueContactPhone, assignedContact.phone),
    row("public.questionnaire.section.venue", "public.questionnaire.field.serviceLocation", event.serviceLocationDescription, venueResponse.serviceLocationDescription),
    row("public.questionnaire.section.venue", "public.questionnaire.field.powerSupply", event.powerSupplyAccess, venueResponse.powerSupplyAccess),
    row("public.questionnaire.section.venue", "public.questionnaire.field.powerNotes", event.powerSupplyNotes, venueResponse.powerSupplyNotes),
    ...additionalClients.map((additionalClient, index) => (
      row(
        "public.questionnaire.section.client",
        "public.questionnaire.field.additionalClient",
        "",
        formatPerson(additionalClient, index),
      )
    )),
    relationshipRow(
      "public.questionnaire.section.planner",
      "public.questionnaire.section.planner",
      formatPlanner(plannerResponse),
    ),
    relationshipRow(
      "public.questionnaire.section.coordinator",
      "public.questionnaire.section.coordinator",
      formatPlanner(coordinatorResponse),
    ),
    row("public.questionnaire.section.additional", "public.questionnaire.field.specialRequests", event.specialRequests, additionalResponse.specialRequests),
    row("public.questionnaire.section.additional", "public.questionnaire.field.operationalNotes", event.clientOperationalNotes, additionalResponse.operationalNotes),
  ];
}

function row(
  sectionKey: TranslationKey,
  labelKey: TranslationKey,
  current: unknown,
  submitted: unknown,
): DiffRow {
  return {
    current: asString(current),
    id: `${sectionKey}-${labelKey}-${asString(submitted)}`,
    labelKey,
    sectionKey,
    submitted: asString(submitted),
  };
}

function phoneRow(
  sectionKey: TranslationKey,
  labelKey: TranslationKey,
  current: unknown,
  submitted: unknown,
): DiffRow {
  const currentPhone = asString(current);
  const submittedPhone = asString(submitted);

  return {
    current: currentPhone ? formatPhone(currentPhone) : "",
    id: `${sectionKey}-${labelKey}-${submittedPhone}`,
    labelKey,
    sectionKey,
    submitted: submittedPhone ? formatPhone(submittedPhone) : "",
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatPerson(person: Record<string, unknown>, index: number) {
  const name = [person.firstName, person.lastName].map(asString).filter(Boolean).join(" ");
  const phone = asString(person.phone);
  const details = [person.role, person.email, phone ? formatPhone(phone) : ""]
    .map(asString)
    .filter(Boolean);
  return [`#${index + 1}`, name, ...details].filter(Boolean).join(" · ");
}

function formatPlanner(planner: Record<string, unknown>) {
  const name = [planner.firstName, planner.lastName].map(asString).filter(Boolean).join(" ");
  const company = asString(planner.company);
  const phone = asString(planner.phone);
  return [
    name || company,
    name ? company : "",
    planner.email,
    phone ? formatPhone(phone) : "",
    planner.primaryEventContact,
  ].map(asString).filter(Boolean).join(" · ");
}

function relationshipRow(
  sectionKey: TranslationKey,
  labelKey: TranslationKey,
  submitted: string,
) {
  return row(sectionKey, labelKey, "", submitted);
}
