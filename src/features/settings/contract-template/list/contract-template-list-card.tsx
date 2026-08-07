import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Translate } from "@/features/crm/shared/types/form-types";

import type { ContractTemplate } from "../types/contract-template";

type ContractTemplateListCardProps = {
  isBusy?: boolean;
  onDelete: (template: ContractTemplate) => void;
  onToggleActive: (template: ContractTemplate) => void;
  contractTemplate: ContractTemplate;
  t: Translate;
};

export function ContractTemplateListCard({ contractTemplate, isBusy, onDelete, onToggleActive, t }: ContractTemplateListCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-cyan-200">{contractTemplate.title}</h2>
            {contractTemplate.isDefault ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t("settings.contractTemplate.status.default")}</span> : null}
            {!contractTemplate.isActive ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">{t("settings.contractTemplate.status.inactive")}</span> : null}
          </div>
          <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">{contractTemplate.templateKey}</p>
          {contractTemplate.description ? <p className="mt-3 text-sm text-zinc-500">{contractTemplate.description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={() => onToggleActive(contractTemplate)}
            type="button"
          >
            {contractTemplate.isActive
              ? t("settings.contractTemplate.action.archive")
              : t("settings.contractTemplate.action.unarchive")}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-rose-800 px-3 text-sm font-bold text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={() => onDelete(contractTemplate)}
            type="button"
          >
            {t("settings.contractTemplate.action.delete")}
          </button>
          <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/settings/contract-templates/${contractTemplate.id}/edit`}>
            <Pencil aria-hidden="true" size={16} />
            {t("settings.contractTemplate.action.edit")}
          </Link>
        </div>
      </div>
    </article>
  );
}
