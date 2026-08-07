import { AlignLeft, Plus } from "lucide-react";

import type { TranslationKey } from "@/core/i18n";

import { templateSnippetGroups } from "./template-snippet-library";

type TemplateSnippetAssistantProps = {
  onInsertBody: (body: string) => void;
  onInsertSubject?: (subject: string) => void;
  t: (key: TranslationKey) => string;
};

export function TemplateSnippetAssistant(props: TemplateSnippetAssistantProps) {
  const { onInsertBody, onInsertSubject, t } = props;

  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-600 bg-zinc-900 text-zinc-200">
          <AlignLeft aria-hidden="true" size={16} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-zinc-100">{t("settings.templateSnippets.title")}</h3>
          <p className="mt-1 text-xs text-zinc-500">{t("settings.templateSnippets.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-3">
        {templateSnippetGroups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500">{t(group.labelKey)}</p>
            <div className="space-y-2">
              {group.snippets.map((snippet, index) => (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1.5" key={`${group.id}-${index}`}>
                  <span className="text-xs font-semibold text-zinc-200">{t(snippet.titleKey)}</span>
                  <span className="flex items-center gap-1">
                    {onInsertSubject && snippet.subject ? (
                      <button
                        className="inline-flex h-6 items-center gap-1 rounded border border-zinc-700 px-2 text-[11px] font-bold text-zinc-200"
                        onClick={() => onInsertSubject(snippet.subject ?? "")}
                        type="button"
                      >
                        <Plus aria-hidden="true" size={10} />
                        {t("settings.templateSnippets.insertSubject")}
                      </button>
                    ) : null}
                    <button
                      className="inline-flex h-6 items-center gap-1 rounded border border-cyan-300/30 bg-cyan-300/10 px-2 text-[11px] font-bold text-cyan-200"
                      onClick={() => onInsertBody(snippet.body)}
                      type="button"
                    >
                      <Plus aria-hidden="true" size={10} />
                      {t("settings.templateSnippets.insertBody")}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
