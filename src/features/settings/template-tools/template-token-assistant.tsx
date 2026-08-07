import { Braces, Plus } from "lucide-react";

import type { TranslationKey } from "@/core/i18n";

import { templateTokenGroups } from "./template-token-catalog";

type TemplateTokenAssistantProps = {
  onInsertBody: (token: string) => void;
  onInsertSubject?: (token: string) => void;
  t: (key: TranslationKey) => string;
  unknownTokens: readonly string[];
};

export function TemplateTokenAssistant(props: TemplateTokenAssistantProps) {
  const { onInsertBody, onInsertSubject, t, unknownTokens } = props;

  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
          <Braces aria-hidden="true" size={16} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-cyan-200">{t("settings.templateTokens.title")}</h3>
          <p className="mt-1 text-xs text-zinc-500">{t("settings.templateTokens.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-3">
        {templateTokenGroups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
              {t(group.labelKey)}
            </p>
            <div className="space-y-2">
              {group.tokens.map((token) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1.5"
                  key={token.token}
                >
                  <span className="truncate text-xs font-semibold text-zinc-200">{`{{${token.token}}}`}</span>
                  <span className="flex items-center gap-1">
                    {onInsertSubject ? (
                      <button
                        className="inline-flex h-6 items-center gap-1 rounded border border-zinc-700 px-2 text-[11px] font-bold text-zinc-200"
                        onClick={() => onInsertSubject(token.token)}
                        type="button"
                      >
                        <Plus aria-hidden="true" size={10} />
                        {t("settings.templateTokens.insertSubject")}
                      </button>
                    ) : null}
                    <button
                      className="inline-flex h-6 items-center gap-1 rounded border border-cyan-300/30 bg-cyan-300/10 px-2 text-[11px] font-bold text-cyan-200"
                      onClick={() => onInsertBody(token.token)}
                      type="button"
                    >
                      <Plus aria-hidden="true" size={10} />
                      {t("settings.templateTokens.insertBody")}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {unknownTokens.length ? (
        <div className="rounded-md border border-amber-400/40 bg-amber-500/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-200">
            {t("settings.templateTokens.unknownTitle")}
          </p>
          <p className="mt-1 text-xs text-amber-100">{t("settings.templateTokens.unknownHint")}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {unknownTokens.map((token) => (
              <span className="rounded border border-amber-300/40 px-2 py-0.5 text-[11px] font-semibold text-amber-100" key={token}>
                {`{{${token}}}`}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
