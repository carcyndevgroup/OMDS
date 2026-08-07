import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Translate } from "@/features/crm/shared/types/form-types";

import type { EmailTemplate } from "../types/email-template";

type EmailTemplateListCardProps = {
  isBusy?: boolean;
  onDelete: (template: EmailTemplate) => void;
  onToggleActive: (template: EmailTemplate) => void;
  emailTemplate: EmailTemplate;
  t: Translate;
};

const kindKeys = {
  contract: "settings.emailTemplate.kind.contract",
  general: "settings.emailTemplate.kind.general",
  invoice: "settings.emailTemplate.kind.invoice",
  questionnaire: "settings.emailTemplate.kind.questionnaire",
  quote: "settings.emailTemplate.kind.quote",
} as const;

export function EmailTemplateListCard({ emailTemplate, isBusy, onDelete, onToggleActive, t }: EmailTemplateListCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-cyan-200">{emailTemplate.title}</h2>
            <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold uppercase text-zinc-300">
              {t(kindKeys[emailTemplate.documentKind])}
            </span>
            {emailTemplate.isDefault ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t("settings.emailTemplate.status.default")}</span> : null}
            {!emailTemplate.isActive ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">{t("settings.emailTemplate.status.inactive")}</span> : null}
          </div>
          <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">{emailTemplate.templateKey}</p>
          <p className="mt-2 text-sm text-zinc-300">{emailTemplate.subject}</p>
          {emailTemplate.description ? <p className="mt-3 text-sm text-zinc-500">{emailTemplate.description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={() => onToggleActive(emailTemplate)}
            type="button"
          >
            {emailTemplate.isActive
              ? t("settings.emailTemplate.action.archive")
              : t("settings.emailTemplate.action.unarchive")}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-rose-800 px-3 text-sm font-bold text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={() => onDelete(emailTemplate)}
            type="button"
          >
            {t("settings.emailTemplate.action.delete")}
          </button>
          <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/settings/email-templates/${emailTemplate.id}/edit`}>
            <Pencil aria-hidden="true" size={16} />
            {t("settings.emailTemplate.action.edit")}
          </Link>
        </div>
      </div>
    </article>
  );
}
