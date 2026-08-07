"use client";

import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { questionFieldOptions, questionTypeOptions } from "../components/questionnaire-definition-options";
import { QuestionnaireTemplatePageHeader } from "../components/questionnaire-template-page-header";

type OptionGroup = {
  id: string;
  items: Array<(typeof questionFieldOptions)[number]>;
};

const groupOrder = ["additional", "client", "coordinator", "event", "planner", "venue"];

function groupQuestionFields() {
  const groups = new Map<string, Array<(typeof questionFieldOptions)[number]>>();

  for (const option of questionFieldOptions) {
    const prefix = option.value.split(".")[0] || "other";
    const current = groups.get(prefix) ?? [];
    current.push(option);
    groups.set(prefix, current);
  }

  const sorted = Array.from(groups.entries()).sort((a, b) => {
    const leftIndex = groupOrder.indexOf(a[0]);
    const rightIndex = groupOrder.indexOf(b[0]);

    const safeLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const safeRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    if (safeLeft === safeRight) return a[0].localeCompare(b[0]);
    return safeLeft - safeRight;
  });

  const grouped: OptionGroup[] = sorted.map(([id, items]) => ({ id, items }));
  return grouped;
}

function formatGroupLabel(groupId: string) {
  return groupId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function QuestionnaireTemplateCatalog() {
  const { t } = useTranslation();
  const fieldGroups = groupQuestionFields();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <QuestionnaireTemplatePageHeader
          backLabel={t("settings.questionnaireTemplate.action.back")}
          title={t("settings.questionnaireTemplate.catalog.title")}
        />
        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-300">{t("settings.questionnaireTemplate.catalog.subtitle")}</p>
          <p className="mt-2 text-xs text-zinc-500">{t("settings.questionnaireTemplate.catalog.helper")}</p>
          <div className="mt-4">
            <Link
              className="inline-flex h-10 items-center rounded-md border border-cyan-300/40 px-4 text-sm font-bold text-cyan-200"
              href="/settings/questionnaire-templates"
            >
              {t("settings.questionnaireTemplate.catalog.backToTemplates")}
            </Link>
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-bold text-white">{t("settings.questionnaireTemplate.catalog.questionTypesTitle")}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-3">
            {questionTypeOptions.map((option) => (
              <li key={option.value} className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                {t(option.labelKey)}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          {fieldGroups.map((group) => (
            <article key={group.id} className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">{formatGroupLabel(group.id)}</h3>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item.value} className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300">
                    <p className="font-bold text-zinc-100">{t(item.labelKey)}</p>
                    <p className="mt-1 text-xs text-zinc-500">{item.value}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
