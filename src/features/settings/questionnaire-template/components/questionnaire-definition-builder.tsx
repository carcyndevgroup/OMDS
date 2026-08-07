"use client";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { questionFieldOptions, questionTypeOptions } from "./questionnaire-definition-options";
import { QuestionnaireDefinitionPreview } from "./questionnaire-definition-preview";
import { QuestionnaireLocalizedTextFields } from "./questionnaire-localized-text-fields";
import {
  createQuestionnaireQuestion,
  createQuestionnaireSection,
  parseQuestionnaireDefinition,
  type QuestionnaireDefinitionModel,
} from "../utils/questionnaire-definition";

type QuestionnaireDefinitionBuilderProps = {
  value: string;
  onChange: (value: string) => void;
};
export function QuestionnaireDefinitionBuilder({ onChange, value }: QuestionnaireDefinitionBuilderProps) {
  const { locale, t } = useTranslation();
  const definition = parseQuestionnaireDefinition(value);
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number>(0);
  const [catalogFieldOptions, setCatalogFieldOptions] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/settings/questionnaire-field-catalog", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("questionnaire_field_catalog_unavailable");
        return response.json() as Promise<{ data: Array<{ fieldKey: string; isActive: boolean; labelEn: string; labelEs: string; sortOrder: string }> }>;
      })
      .then((payload) => {
        if (controller.signal.aborted) return;
        const options = payload.data
          .filter((item) => item.isActive)
          .sort((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
          .map((item) => ({
            label: locale === "es" ? item.labelEs : item.labelEn,
            value: item.fieldKey,
          }));
        setCatalogFieldOptions(options);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalogFieldOptions([]);
      });
    return () => controller.abort();
  }, [locale]);

  const localizedQuestionTypeOptions = questionTypeOptions.map((option) => ({
    label: t(option.labelKey),
    value: option.value,
  }));
  const fallbackQuestionFieldOptions = questionFieldOptions.map((option) => ({
    label: t(option.labelKey),
    value: option.value,
  }));
  const localizedQuestionFieldOptions = catalogFieldOptions.length ? catalogFieldOptions : fallbackQuestionFieldOptions;

  const commit = (nextDefinition: QuestionnaireDefinitionModel) => {
    onChange(JSON.stringify(nextDefinition, null, 2));
  };

  const updateSection = (index: number, updater: (section: QuestionnaireDefinitionModel["sections"][number]) => QuestionnaireDefinitionModel["sections"][number]) => {
    if (!definition) return;
    const sections = definition.sections.map((section, currentIndex) => (currentIndex === index ? updater(section) : section));
    commit({ sections });
  };

  const updateQuestion = (
    sectionIndex: number,
    questionIndex: number,
    updater: (question: QuestionnaireDefinitionModel["sections"][number]["questions"][number]) => QuestionnaireDefinitionModel["sections"][number]["questions"][number],
  ) => {
    if (!definition) return;
    const sections = definition.sections.map((section, currentSectionIndex) => {
      if (currentSectionIndex !== sectionIndex) return section;
      return {
        ...section,
        questions: section.questions.map((question, currentQuestionIndex) =>
          currentQuestionIndex === questionIndex ? updater(question) : question,
        ),
      };
    });
    commit({ sections });
  };

  const addSection = () => commit({ sections: [...(definition?.sections ?? []), createQuestionnaireSection()] });
  const removeSection = (index: number) => commit({ sections: definition?.sections.filter((_, currentIndex) => currentIndex !== index) ?? [] });
  const addQuestion = (sectionIndex: number) => {
    if (!definition) return;
    const sections = definition.sections.map((section, currentIndex) => {
      if (currentIndex !== sectionIndex) return section;
      return { ...section, questions: [...section.questions, createQuestionnaireQuestion()] };
    });
    commit({ sections });
  };
  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!definition) return;
    const sections = definition.sections.map((section, currentIndex) => {
      if (currentIndex !== sectionIndex) return section;
      return { ...section, questions: section.questions.filter((_, currentQuestionIndex) => currentQuestionIndex !== questionIndex) };
    });
    commit({ sections });
  };
  const moveQuestion = (sectionIndex: number, questionIndex: number, direction: "up" | "down") => {
    if (!definition) return;
    const sections = definition.sections.map((section, currentIndex) => {
      if (currentIndex !== sectionIndex) return section;
      const nextIndex = direction === "up" ? questionIndex - 1 : questionIndex + 1;
      if (nextIndex < 0 || nextIndex >= section.questions.length) return section;
      const questions = [...section.questions];
      const [target] = questions.splice(questionIndex, 1);
      questions.splice(nextIndex, 0, target);
      return { ...section, questions };
    });
    commit({ sections });
  };

  useEffect(() => {
    const sectionCount = definition?.sections.length ?? 0;
    if (!sectionCount) {
      setExpandedSectionIndex(0);
      return;
    }
    if (expandedSectionIndex >= sectionCount) setExpandedSectionIndex(sectionCount - 1);
  }, [definition, expandedSectionIndex]);

  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">{t("settings.questionnaireTemplate.builder.title")}</h2>
          <p className="text-sm text-zinc-500">{t("settings.questionnaireTemplate.builder.subtitle")}</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/40 px-3 text-sm font-bold text-cyan-200"
          onClick={addSection}
          type="button"
        >
          <Plus aria-hidden="true" size={16} />
          {t("settings.questionnaireTemplate.builder.addSection")}
        </button>
      </div>

      {!definition ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {t("settings.questionnaireTemplate.builder.invalidJson")}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          {(definition?.sections ?? []).map((section, sectionIndex) => {
            const isExpanded = expandedSectionIndex === sectionIndex;
            return (
              <article key={`${sectionIndex}-${section.title.en || "section"}`} className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-cyan-200"
                    onClick={() => setExpandedSectionIndex(isExpanded ? -1 : sectionIndex)}
                    type="button"
                  >
                    {isExpanded ? <ChevronUp aria-hidden="true" size={15} /> : <ChevronDown aria-hidden="true" size={15} />}
                    {t("settings.questionnaireTemplate.builder.sectionLabel")} {sectionIndex + 1}
                    <span className="text-[11px] tracking-normal text-zinc-500">
                      {isExpanded ? t("settings.questionnaireTemplate.builder.action.collapse") : t("settings.questionnaireTemplate.builder.action.expand")}
                    </span>
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200"
                    onClick={() => removeSection(sectionIndex)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                    {t("settings.questionnaireTemplate.builder.removeSection")}
                  </button>
                </div>
                {isExpanded ? (
                  <>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <QuestionnaireLocalizedTextFields
                        label={t("settings.questionnaireTemplate.builder.sectionTitle")}
                        onChange={(nextTitle) => updateSection(sectionIndex, (currentSection) => ({ ...currentSection, title: nextTitle }))}
                        t={t}
                        value={section.title}
                      />
                      <QuestionnaireLocalizedTextFields
                        label={t("settings.questionnaireTemplate.builder.sectionDescription")}
                        multiline
                        onChange={(nextDescription) => updateSection(sectionIndex, (currentSection) => ({ ...currentSection, description: nextDescription }))}
                        placeholder={t("settings.questionnaireTemplate.placeholder.description")}
                        t={t}
                        value={section.description}
                      />
                    </div>

                    <div className="mt-5 space-y-3">
                      {section.questions.map((question, questionIndex) => (
                        <div key={`${sectionIndex}-${questionIndex}`} className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="text-sm font-bold text-white">
                              {t("settings.questionnaireTemplate.builder.questionLabel")} {questionIndex + 1}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 disabled:opacity-50"
                                disabled={questionIndex === 0}
                                onClick={() => moveQuestion(sectionIndex, questionIndex, "up")}
                                type="button"
                              >
                                <ChevronUp aria-hidden="true" size={14} />
                                {t("settings.questionnaireTemplate.builder.action.moveQuestionUp")}
                              </button>
                              <button
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 disabled:opacity-50"
                                disabled={questionIndex === section.questions.length - 1}
                                onClick={() => moveQuestion(sectionIndex, questionIndex, "down")}
                                type="button"
                              >
                                <ChevronDown aria-hidden="true" size={14} />
                                {t("settings.questionnaireTemplate.builder.action.moveQuestionDown")}
                              </button>
                              <button
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200"
                                onClick={() => removeQuestion(sectionIndex, questionIndex)}
                                type="button"
                              >
                                <Trash2 aria-hidden="true" size={15} />
                                {t("settings.questionnaireTemplate.builder.removeQuestion")}
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <QuestionnaireLocalizedTextFields
                              label={t("settings.questionnaireTemplate.builder.questionText")}
                              onChange={(nextLabel) => updateQuestion(sectionIndex, questionIndex, (currentQuestion) => ({ ...currentQuestion, label: nextLabel }))}
                              t={t}
                              value={question.label}
                            />
                            <CrmSelect
                              label={t("settings.questionnaireTemplate.builder.questionField")}
                              onChange={(nextFieldKey) => updateQuestion(sectionIndex, questionIndex, (currentQuestion) => ({ ...currentQuestion, fieldKey: nextFieldKey }))}
                              options={localizedQuestionFieldOptions}
                              t={t}
                              value={question.fieldKey}
                            />
                            <CrmSelect
                              label={t("settings.questionnaireTemplate.builder.questionType")}
                              onChange={(nextType) => updateQuestion(sectionIndex, questionIndex, (currentQuestion) => ({ ...currentQuestion, type: nextType }))}
                              options={localizedQuestionTypeOptions}
                              t={t}
                              value={question.type}
                            />
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <QuestionnaireLocalizedTextFields
                              label={t("settings.questionnaireTemplate.builder.questionHelper")}
                              multiline
                              onChange={(nextHelper) => updateQuestion(sectionIndex, questionIndex, (currentQuestion) => ({ ...currentQuestion, helper: nextHelper }))}
                              placeholder={t("settings.questionnaireTemplate.placeholder.helper")}
                              t={t}
                              value={question.helper}
                            />
                            <label className="flex items-center gap-3 rounded-md border border-zinc-800 px-3 py-3 text-sm font-bold text-zinc-200">
                              <input
                                checked={question.required}
                                className="h-4 w-4 accent-cyan-300"
                                onChange={(event) => updateQuestion(sectionIndex, questionIndex, (currentQuestion) => ({ ...currentQuestion, required: event.target.checked }))}
                                type="checkbox"
                              />
                              {t("settings.questionnaireTemplate.builder.questionRequired")}
                            </label>
                          </div>
                        </div>
                      ))}
                      <button
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200"
                        onClick={() => addQuestion(sectionIndex)}
                        type="button"
                      >
                        <Plus aria-hidden="true" size={16} />
                        {t("settings.questionnaireTemplate.builder.addQuestion")}
                      </button>
                    </div>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>

        <QuestionnaireDefinitionPreview definition={definition} locale={locale} t={t} />
      </div>
    </section>
  );
}
