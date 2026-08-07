import type { TranslationKey } from "@/core/i18n";
import type { Json } from "@/core/supabase/json.types";

import { formatPhone } from "../../shared/utils/phone-format";

type QuestionnaireResponseViewProps = {
  responseData: Json;
  t: (key: TranslationKey) => string;
};

const sections = [
  ["public.questionnaire.section.client", "client"],
  ["public.questionnaire.section.event", "event"],
  ["public.questionnaire.section.venue", "venue"],
  ["public.questionnaire.section.planner", "externalPlanner"],
  ["public.questionnaire.section.coordinator", "dayOfCoordinator"],
  ["public.questionnaire.section.additional", "additional"],
] as const;

const labelMap = {
  address: "public.questionnaire.field.address",
  email: "public.questionnaire.field.email",
  eventHashtags: "public.questionnaire.field.eventHashtags",
  eventName: "public.questionnaire.field.eventName",
  facebook: "public.questionnaire.field.facebook",
  firstName: "public.questionnaire.field.firstName",
  instagram: "public.questionnaire.field.instagram",
  lastName: "public.questionnaire.field.lastName",
  legalFirstName: "public.questionnaire.field.legalFirstName",
  legalLastName: "public.questionnaire.field.legalLastName",
  marqueeNames: "public.questionnaire.field.marqueeNames",
  name: "public.questionnaire.field.venueName",
  operationalNotes: "public.questionnaire.field.operationalNotes",
  phone: "public.questionnaire.field.phone",
  powerSupplyAccess: "public.questionnaire.field.powerSupply",
  powerSupplyNotes: "public.questionnaire.field.powerNotes",
  preferredCommunicationMethod: "public.questionnaire.field.preferredCommunication",
  primaryEventContact: "public.questionnaire.field.primaryContact",
  role: "public.questionnaire.field.role",
  serviceEndTime: "public.questionnaire.field.serviceEndTime",
  serviceLocationDescription: "public.questionnaire.field.serviceLocation",
  serviceStartTime: "public.questionnaire.field.serviceStartTime",
  specialRequests: "public.questionnaire.field.specialRequests",
} satisfies Record<string, TranslationKey>;

export function QuestionnaireResponseView(props: QuestionnaireResponseViewProps) {
  const { responseData, t } = props;
  const root = asRecord(responseData);

  return (
    <div className="space-y-4 border-t border-zinc-800 pt-5">
      <h4 className="text-sm font-black uppercase tracking-wide text-zinc-500">
        {t("crm.questionnaire.response.title")}
      </h4>
      {sections.map(([titleKey, key]) => (
        <section className="rounded-md border border-zinc-800 p-4" key={key}>
          <h5 className="font-bold text-cyan-200">{t(titleKey)}</h5>
          <ResponseFields data={asRecord(root[key])} t={t} />
        </section>
      ))}
    </div>
  );
}

function ResponseFields(props: { data: Record<string, unknown>; t: (key: TranslationKey) => string }) {
  const entries = Object.entries(props.data).filter(([, value]) => BooleanValue(value));

  if (entries.length === 0) {
    return <p className="mt-3 text-sm text-zinc-500">{props.t("crm.questionnaire.response.empty")}</p>;
  }

  return (
    <dl className="mt-3 grid gap-3 md:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="text-xs font-bold uppercase text-zinc-500">
            {props.t(labelFor(key))}
          </dt>
          <dd className="mt-1 text-sm text-zinc-100">{formatValue(key, value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function BooleanValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== null && value !== undefined && value !== "";
}

function formatValue(key: string, value: unknown): string {
  if (key.toLowerCase().includes("phone") && typeof value === "string") {
    return formatPhone(value);
  }

  if (Array.isArray(value)) return `${value.length}`;
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, nestedValue]) => Boolean(nestedValue))
      .map(([nestedKey, nestedValue]) => {
        if (nestedKey.toLowerCase().includes("phone") && typeof nestedValue === "string") {
          return formatPhone(nestedValue);
        }

        return String(nestedValue);
      })
      .join(" · ");
  }

  return String(value);
}

function labelFor(key: string): TranslationKey {
  return key in labelMap ? labelMap[key as keyof typeof labelMap] : "common.notProvided";
}
