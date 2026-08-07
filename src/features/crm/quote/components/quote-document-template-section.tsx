"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { BookingType } from "@/features/crm/client/types/client";
import type { Translate } from "@/features/crm/shared/types/form-types";
import type { TranslationKey } from "@/core/i18n";
import type { EventType } from "@/features/crm/shared/types/crm-options";

import { useContractTemplateOptions } from "@/features/settings/contract-template";
import { useQuestionnaireTemplateOptions } from "@/features/settings/questionnaire-template";
import type { QuoteUpdateVersionValues, QuoteVersion } from "../types/quote";
import { SelectField } from "./quote-settings-fields";

type TemplateKind = "contract" | "questionnaire";

type QuoteDocumentTemplateSectionProps = {
  bookingType: BookingType;
  eventType: EventType;
  kind: TemplateKind;
  onUpdate: (values: QuoteUpdateVersionValues) => Promise<void>;
  readOnly: boolean;
  t: Translate;
  version: QuoteVersion;
};

type TemplateFieldKey = "contractTemplateKey" | "questionnaireTemplateKey";

type TemplateConfig = {
  fieldKey: TemplateFieldKey;
  labelKey: TranslationKey;
  saveErrorKey: TranslationKey;
  savedKey: TranslationKey;
};

const templateConfig: Record<TemplateKind, TemplateConfig> = {
  contract: {
    fieldKey: "contractTemplateKey",
    labelKey: "crm.quote.settings.contract.select",
    saveErrorKey: "crm.quote.settings.contract.saveError",
    savedKey: "crm.quote.settings.contract.saved",
  },
  questionnaire: {
    fieldKey: "questionnaireTemplateKey",
    labelKey: "crm.quote.settings.questionnaire.select",
    saveErrorKey: "crm.quote.settings.questionnaire.saveError",
    savedKey: "crm.quote.settings.questionnaire.saved",
  },
};

const eventTypeKeys: Record<EventType, TranslationKey> = {
  convention: "crm.quote.settings.eventType.convention",
  corporate_event: "crm.quote.settings.eventType.corporateEvent",
  other: "crm.quote.settings.eventType.other",
  social_event: "crm.quote.settings.eventType.socialEvent",
  wedding: "crm.quote.settings.eventType.wedding",
};

const bookingTypeKeys: Record<BookingType, TranslationKey> = {
  direct: "crm.quote.settings.bookingType.direct",
  preferred_vendor: "crm.quote.settings.bookingType.preferredVendor",
};

type TemplateChoice = {
  label: string;
  value: string;
};

export function QuoteDocumentTemplateSection(props: QuoteDocumentTemplateSectionProps) {
  const { bookingType, eventType, kind, onUpdate, readOnly, t, version } = props;
  const config = templateConfig[kind];
  const contractTemplateState = useContractTemplateOptions();
  const questionnaireTemplateState = useQuestionnaireTemplateOptions();
  const currentTemplateKey = version[config.fieldKey] ?? "";

  const filteredTemplates = useMemo(() => {
    const templates = kind === "contract" ? contractTemplateState.options : questionnaireTemplateState.options;
    return templates.filter((template) => {
      const matchesBookingType = !template.bookingType || template.bookingType === bookingType;
      const matchesEventType = !template.eventType || template.eventType === eventType;
      return matchesBookingType && matchesEventType;
    });
  }, [bookingType, contractTemplateState.options, eventType, kind, questionnaireTemplateState.options]);

  const templateChoices = useMemo<TemplateChoice[]>(() => {
    const choices = filteredTemplates.map((template) => ({ label: template.title, value: template.templateKey }));
    if (currentTemplateKey && !choices.some((choice) => choice.value === currentTemplateKey)) {
      choices.unshift({ label: currentTemplateKey, value: currentTemplateKey });
    }
    return choices;
  }, [currentTemplateKey, filteredTemplates]);

  const [templateKey, setTemplateKey] = useState(currentTemplateKey);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const didAutoSelect = useRef(false);

  useEffect(() => setTemplateKey(currentTemplateKey), [currentTemplateKey]);

  const defaultTemplateKey =
    filteredTemplates.find((template) => template.isDefault)?.templateKey ?? filteredTemplates[0]?.templateKey;

  useEffect(() => {
    if (readOnly || didAutoSelect.current || currentTemplateKey) return;
    if (!defaultTemplateKey) return;

    didAutoSelect.current = true;
    void save(defaultTemplateKey, "");
  }, [currentTemplateKey, defaultTemplateKey, readOnly]);

  const save = async (nextTemplateKey: string, previousTemplateKey = templateKey) => {
    setTemplateKey(nextTemplateKey);
    setSaveStatus("saving");
    try {
      await onUpdate({
        applyExchangeRateMargin: version.applyExchangeRateMargin,
        appliesIsrRetention: version.appliesIsrRetention,
        appliesIvaRetention: version.appliesIvaRetention,
        appliesIvaTax: version.appliesIvaTax,
        contractTemplateKey: kind === "contract" ? nextTemplateKey || null : version.contractTemplateKey,
        discountType: version.discountType,
        discountValueMxn: version.discountValueMxn,
        displayCurrency: version.displayCurrency,
        exchangeRateMarginPercent: version.exchangeRateMarginPercent,
        exchangeRateToMxn: version.exchangeRateToMxn,
        expiresAt: version.expiresAt,
        isrRetentionRatePercent: version.isrRetentionRatePercent,
        ivaRetentionRatePercent: version.ivaRetentionRatePercent,
        paymentPlanId: version.paymentPlanId,
        questionnaireTemplateKey:
          kind === "questionnaire" ? nextTemplateKey || null : version.questionnaireTemplateKey,
        taxRatePercent: version.taxRatePercent,
      });
      setSaveStatus("saved");
    } catch {
      setTemplateKey(previousTemplateKey);
      setSaveStatus("error");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">{t("crm.quote.settings.document.helper")}</p>
      <SelectField label={t(config.labelKey)} onChange={save} readOnly={readOnly} value={templateKey}>
        {templateChoices.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <p className="text-xs text-zinc-500">
        {t("crm.quote.settings.document.context")} {" "}
        {t(bookingTypeKeys[bookingType])} / {t(eventTypeKeys[eventType])}
      </p>
      {saveStatus === "saved" ? <p className="text-xs font-bold text-cyan-200">{t(config.savedKey)}</p> : null}
      {saveStatus === "error" ? <p className="text-xs font-bold text-rose-300">{t(config.saveErrorKey)}</p> : null}
    </div>
  );
}
