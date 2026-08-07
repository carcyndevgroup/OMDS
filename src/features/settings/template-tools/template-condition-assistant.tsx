import { Filter, Plus } from "lucide-react";

import type { TranslationKey } from "@/core/i18n";

import { buildConditionalSnippet } from "./template-condition-library";

type TemplateConditionAssistantProps = {
  onInsertBody: (snippet: string) => void;
  onInsertSubject?: (snippet: string) => void;
  t: (key: TranslationKey) => string;
};

export function TemplateConditionAssistant(props: TemplateConditionAssistantProps) {
  const { onInsertBody, onInsertSubject, t } = props;

  const rows = [
    {
      key: "direct",
      label: t("settings.templateConditions.item.direct"),
      snippet: buildConditionalSnippet("bookingType", ["direct"], t("settings.templateConditions.placeholder")),
    },
    {
      key: "preferredVendor",
      label: t("settings.templateConditions.item.preferredVendor"),
      snippet: buildConditionalSnippet("bookingType", ["preferred_vendor"], t("settings.templateConditions.placeholder")),
    },
    {
      key: "wedding",
      label: t("settings.templateConditions.item.wedding"),
      snippet: buildConditionalSnippet("eventType", ["wedding"], t("settings.templateConditions.placeholder")),
    },
    {
      key: "contractOnly",
      label: t("settings.templateConditions.item.contractOnly"),
      snippet: buildConditionalSnippet("documentKind", ["contract"], t("settings.templateConditions.placeholder")),
    },
  ] as const;

  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-600 bg-zinc-900 text-zinc-200">
          <Filter aria-hidden="true" size={16} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-zinc-100">{t("settings.templateConditions.title")}</h3>
          <p className="mt-1 text-xs text-zinc-500">{t("settings.templateConditions.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1.5" key={row.key}>
            <span className="text-xs font-semibold text-zinc-200">{row.label}</span>
            <span className="flex items-center gap-1">
              {onInsertSubject ? (
                <button
                  className="inline-flex h-6 items-center gap-1 rounded border border-zinc-700 px-2 text-[11px] font-bold text-zinc-200"
                  onClick={() => onInsertSubject(row.snippet)}
                  type="button"
                >
                  <Plus aria-hidden="true" size={10} />
                  {t("settings.templateConditions.insertSubject")}
                </button>
              ) : null}
              <button
                className="inline-flex h-6 items-center gap-1 rounded border border-cyan-300/30 bg-cyan-300/10 px-2 text-[11px] font-bold text-cyan-200"
                onClick={() => onInsertBody(row.snippet)}
                type="button"
              >
                <Plus aria-hidden="true" size={10} />
                {t("settings.templateConditions.insertBody")}
              </button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
