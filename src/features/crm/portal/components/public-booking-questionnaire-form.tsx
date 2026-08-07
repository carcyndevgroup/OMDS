"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import type { Json } from "@/core/supabase/json.types";
import {
  createBilingualQuestionnaireDefinition,
  parseQuestionnaireDefinition,
  resolveLocalizedText,
} from "@/features/settings/questionnaire-template/utils/questionnaire-definition";

import {
  emptyClient,
  emptySecondaryContact,
  formValuesFromResponse,
  type AdditionalClient,
  type FormValues,
  type SecondaryContact,
} from "./public-booking-questionnaire-data";
import { buildResponse } from "./public-booking-questionnaire-response";
import { QuestionnaireSectionFields } from "./public-booking-questionnaire-section-fields";
import { QuestionnaireSection } from "./public-questionnaire-fields";

type PublicBookingQuestionnaireFormProps = {
  accessKey: string;
  isResubmission?: boolean;
  responseData: Json;
  templateDefinition: Json;
  questionnaireId: string;
};

type QuestionnaireTab = "additional" | "client" | "coordinator" | "event" | "planner" | "venue";

type SectionConfig = {
  definitionIndex: number;
  labelKey: TranslationKey;
  questionPrefix: string;
};

const tabs: { id: QuestionnaireTab; labelKey: TranslationKey }[] = [
  { id: "client", labelKey: "public.questionnaire.section.client" },
  { id: "event", labelKey: "public.questionnaire.section.event" },
  { id: "venue", labelKey: "public.questionnaire.section.venue" },
  { id: "planner", labelKey: "public.questionnaire.section.planner" },
  { id: "coordinator", labelKey: "public.questionnaire.section.coordinator" },
  { id: "additional", labelKey: "public.questionnaire.section.additional" },
];

const sectionByTab: Record<QuestionnaireTab, SectionConfig> = {
  additional: { definitionIndex: 5, labelKey: "public.questionnaire.section.additional", questionPrefix: "additional" },
  client: { definitionIndex: 0, labelKey: "public.questionnaire.section.client", questionPrefix: "client" },
  coordinator: { definitionIndex: 4, labelKey: "public.questionnaire.section.coordinator", questionPrefix: "coordinator" },
  event: { definitionIndex: 1, labelKey: "public.questionnaire.section.event", questionPrefix: "event" },
  planner: { definitionIndex: 3, labelKey: "public.questionnaire.section.planner", questionPrefix: "planner" },
  venue: { definitionIndex: 2, labelKey: "public.questionnaire.section.venue", questionPrefix: "venue" },
};

export function PublicBookingQuestionnaireForm(props: PublicBookingQuestionnaireFormProps) {
  const { accessKey, isResubmission = false, questionnaireId, responseData, templateDefinition } = props;
  const { locale, t } = useTranslation();
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(() => formValuesFromResponse(responseData));
  const definition = parseQuestionnaireDefinition(templateDefinition) ?? createBilingualQuestionnaireDefinition();
  const [activeTab, setActiveTab] = useState<QuestionnaireTab>("client");
  const [showTabPrompt, setShowTabPrompt] = useState(false);
  const [status, setStatus] = useState<"error" | "idle" | "saved" | "saving" | "submitted">("idle");
  const [visitedTabs, setVisitedTabs] = useState<QuestionnaireTab[]>(
    isResubmission ? tabs.map((tab) => tab.id) : ["client"],
  );
  const allTabsVisited = tabs.every((tab) => visitedTabs.includes(tab.id));

  const setField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const setDynamicField = (fieldKey: string, value: Json) => {
    setValues((current) => ({
      ...current,
      dynamicResponses: {
        ...current.dynamicResponses,
        [fieldKey]: value,
      },
    }));
  };

  const setAdditionalClient = (index: number, field: keyof AdditionalClient, value: string) => {
    setValues((current) => ({
      ...current,
      additionalClients: current.additionalClients.map((client, clientIndex) =>
        clientIndex === index ? { ...client, [field]: value } : client,
      ),
    }));
  };

  const setSecondaryContact = (index: number, field: keyof SecondaryContact, value: string) => {
    setValues((current) => ({
      ...current,
      secondaryContacts: current.secondaryContacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, [field]: value } : contact,
      ),
    }));
  };

  const addAdditionalClient = () => {
    setValues((current) => ({
      ...current,
      additionalClients: [...current.additionalClients, emptyClient()],
    }));
  };

  const addSecondaryContact = () => {
    setValues((current) => ({
      ...current,
      secondaryContacts: [...current.secondaryContacts, emptySecondaryContact()],
    }));
  };

  const performAction = async (action: "save" | "submit") => {
    if (action === "submit" && !allTabsVisited) {
      setShowTabPrompt(true);
      return;
    }

    setStatus("saving");
    const response = await fetch(`/api/portal/${accessKey}/questionnaires/${questionnaireId}`, {
      body: JSON.stringify({ action, responseData: buildResponse(values) }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus(action === "save" ? "saved" : "submitted");
    router.refresh();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await performAction("submit");
  };

  const sectionConfig = sectionByTab[activeTab];
  const section = definition.sections[sectionConfig.definitionIndex];
  const sectionTitle = resolveLocalizedText(section?.title, locale) || t(sectionConfig.labelKey);
  const sectionDescription = resolveLocalizedText(section?.description, locale);

  return (
    <form className="space-y-6" onSubmit={(event) => void submit(event)}>
      <nav className="flex gap-5 overflow-x-auto border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            className={[
              "shrink-0 border-b-2 px-1 py-3 text-sm font-bold transition",
              activeTab === tab.id
                ? "border-cyan-300 text-cyan-200"
                : "border-transparent text-zinc-500 hover:text-white",
            ].join(" ")}
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setShowTabPrompt(false);
              setVisitedTabs((current) => (current.includes(tab.id) ? current : [...current, tab.id]));
            }}
            type="button"
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </nav>

      <QuestionnaireSection title={sectionTitle}>
        {sectionDescription ? <p className="text-sm text-zinc-500">{sectionDescription}</p> : null}
        <QuestionnaireSectionFields
          accessKey={accessKey}
          dynamicFieldValues={values.dynamicResponses}
          locale={locale}
          onAddAdditionalClient={addAdditionalClient}
          onAddSecondaryContact={addSecondaryContact}
          onSetDynamicField={setDynamicField}
          onSetAdditionalClient={setAdditionalClient}
          onSetField={setField}
          onSetSecondaryContact={setSecondaryContact}
          questionnaireId={questionnaireId}
          questionPrefix={sectionConfig.questionPrefix}
          questions={section?.questions ?? []}
          values={values}
        />
      </QuestionnaireSection>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-bold text-zinc-100 transition hover:border-cyan-300 hover:text-cyan-200 disabled:opacity-60"
          disabled={status === "saving"}
          onClick={() => void performAction("save")}
          type="button"
        >
          {status === "saving" ? t("public.portal.quote.responding") : t("public.questionnaire.action.save")}
        </button>
        <button
          className={[
            "rounded-md px-5 py-3 text-sm font-black transition disabled:opacity-60",
            allTabsVisited
              ? "bg-cyan-300 text-zinc-950 hover:bg-cyan-200"
              : "border border-zinc-700 bg-zinc-900 text-zinc-500",
          ].join(" ")}
          disabled={status === "saving"}
          type="submit"
        >
          {status === "saving" ? t("public.portal.quote.responding") : t(isResubmission ? "public.questionnaire.action.resubmit" : "public.questionnaire.action.submit")}
        </button>
      </div>
      {showTabPrompt && !allTabsVisited ? (
        <p className="text-sm text-amber-200">{t("public.questionnaire.completeTabs")}</p>
      ) : null}
      {status === "saved" ? <p className="text-sm text-cyan-200">{t("public.questionnaire.savedDraft")}</p> : null}
      {status === "submitted" ? <p className="text-sm text-cyan-200">{t("public.questionnaire.saved")}</p> : null}
      {status === "error" ? <p className="text-sm text-rose-300">{t("public.questionnaire.submitError")}</p> : null}
    </form>
  );
}
