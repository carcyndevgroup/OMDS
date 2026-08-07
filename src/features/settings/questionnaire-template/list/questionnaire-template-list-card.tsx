import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuestionnaireTemplate } from "../types/questionnaire-template";

type QuestionnaireTemplateListCardProps = {
  isBusy?: boolean;
  onDelete: (template: QuestionnaireTemplate) => void;
  onToggleActive: (template: QuestionnaireTemplate) => void;
  questionnaireTemplate: QuestionnaireTemplate;
  t: Translate;
};

export function QuestionnaireTemplateListCard({ isBusy, onDelete, onToggleActive, questionnaireTemplate, t }: QuestionnaireTemplateListCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-cyan-200">{questionnaireTemplate.title}</h2>
            {questionnaireTemplate.isDefault ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t("settings.questionnaireTemplate.status.default")}</span> : null}
            {!questionnaireTemplate.isActive ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">{t("settings.questionnaireTemplate.status.inactive")}</span> : null}
          </div>
          <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">{questionnaireTemplate.templateKey}</p>
          {questionnaireTemplate.description ? <p className="mt-3 text-sm text-zinc-500">{questionnaireTemplate.description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={() => onToggleActive(questionnaireTemplate)}
            type="button"
          >
            {questionnaireTemplate.isActive
              ? t("settings.questionnaireTemplate.action.archive")
              : t("settings.questionnaireTemplate.action.unarchive")}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-rose-800 px-3 text-sm font-bold text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={() => onDelete(questionnaireTemplate)}
            type="button"
          >
            {t("settings.questionnaireTemplate.action.delete")}
          </button>
          <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/settings/questionnaire-templates/${questionnaireTemplate.id}/edit`}>
            <Pencil aria-hidden="true" size={16} />
            {t("settings.questionnaireTemplate.action.edit")}
          </Link>
        </div>
      </div>
    </article>
  );
}
