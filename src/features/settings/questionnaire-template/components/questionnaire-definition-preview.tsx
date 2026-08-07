"use client";

import type { TranslationKey } from "@/core/i18n";

import {
  resolveLocalizedText,
  type QuestionnaireDefinitionModel,
  type QuestionnaireDefinitionQuestion,
} from "../utils/questionnaire-definition";

type QuestionnaireDefinitionPreviewProps = {
  definition: QuestionnaireDefinitionModel | null;
  locale: "en" | "es";
  t: (key: TranslationKey) => string;
};

export function QuestionnaireDefinitionPreview(props: QuestionnaireDefinitionPreviewProps) {
  const { definition, locale, t } = props;

  return (
    <aside className="space-y-4 rounded-md border border-zinc-800 bg-zinc-950/70 p-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-auto">
      <div>
        <h2 className="text-base font-bold text-white">{t("settings.questionnaireTemplate.preview.title")}</h2>
        <p className="text-sm text-zinc-500">{t("settings.questionnaireTemplate.preview.subtitle")}</p>
      </div>

      {!definition?.sections.length ? (
        <p className="rounded-md border border-dashed border-zinc-800 px-3 py-8 text-center text-sm text-zinc-500">
          {t("settings.questionnaireTemplate.preview.empty")}
        </p>
      ) : null}

      <div className="space-y-4">
        {(definition?.sections ?? []).map((section, sectionIndex) => {
          const sectionTitle = resolveLocalizedText(section.title, locale) || `${t("settings.questionnaireTemplate.builder.sectionLabel")} ${sectionIndex + 1}`;
          const sectionDescription = resolveLocalizedText(section.description, locale);
          return (
            <section className="space-y-3 rounded-md border border-zinc-800 bg-zinc-900/70 p-4" key={`preview-${sectionIndex}`}>
              <h3 className="text-sm font-bold text-cyan-200">{sectionTitle}</h3>
              {sectionDescription ? <p className="text-xs text-zinc-500">{sectionDescription}</p> : null}
              <div className="space-y-3">
                {section.questions.map((question, questionIndex) => (
                  <PreviewQuestion
                    key={`preview-${sectionIndex}-${questionIndex}`}
                    locale={locale}
                    question={question}
                    t={t}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function PreviewQuestion(props: {
  locale: "en" | "es";
  question: QuestionnaireDefinitionQuestion;
  t: (key: TranslationKey) => string;
}) {
  const { locale, question, t } = props;
  const label = resolveLocalizedText(question.label, locale) || t("settings.questionnaireTemplate.preview.untitledQuestion");
  const helper = resolveLocalizedText(question.helper, locale);

  return (
    <label className="block text-sm font-bold text-zinc-300">
      <span className="inline-flex items-center gap-2">
        {label}
        {question.required ? <span className="text-rose-300">*</span> : null}
      </span>
      {helper ? <span className="mt-1 block text-xs font-medium text-zinc-500">{helper}</span> : null}
      <PreviewInput questionType={question.type} t={t} />
    </label>
  );
}

function PreviewInput(props: { questionType: string; t: (key: TranslationKey) => string }) {
  const { questionType, t } = props;

  if (questionType === "textarea" || questionType === "repeatable") {
    return (
      <textarea
        className="mt-2 min-h-24 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        placeholder={questionType === "repeatable" ? t("settings.questionnaireTemplate.preview.repeatablePlaceholder") : ""}
        readOnly
      />
    );
  }

  if (questionType === "select") {
    return (
      <select className="mt-2 h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-300" disabled>
        <option>{t("settings.questionnaireTemplate.preview.selectPlaceholder")}</option>
      </select>
    );
  }

  if (questionType === "file") {
    return (
      <div className="mt-2 space-y-2 rounded-md border border-dashed border-zinc-700 px-3 py-3 text-xs text-zinc-400">
        <input className="w-full text-xs text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-300 file:px-2 file:py-1 file:text-zinc-950" type="file" />
        <p>{t("settings.questionnaireTemplate.preview.fileHint")}</p>
      </div>
    );
  }

  if (questionType === "image") {
    return (
      <div className="mt-2 space-y-2 rounded-md border border-dashed border-zinc-700 px-3 py-3 text-xs text-zinc-400">
        <input
          accept="image/*"
          className="w-full text-xs text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-300 file:px-2 file:py-1 file:text-zinc-950"
          type="file"
        />
        <p>{t("settings.questionnaireTemplate.preview.imageHint")}</p>
      </div>
    );
  }

  const htmlType = questionType === "phone" ? "tel" : questionType;
  const allowedTypes = new Set(["text", "email", "tel", "number", "date", "time"]);
  return (
    <input
      className="mt-2 h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
      readOnly
      type={allowedTypes.has(htmlType) ? htmlType : "text"}
    />
  );
}
