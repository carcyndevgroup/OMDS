"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n";
import { extractTemplateTokenKeys } from "@/features/settings/template-tools/template-token-catalog";
import {
  buildTemplateLocaleParityReport,
  type TemplateLocaleParityReport,
} from "@/features/settings/template-tools/template-locale-parity";
import { TemplateLocaleParityPanel } from "@/features/settings/template-tools/template-locale-parity-panel";
import { TemplateUsagePanel } from "@/features/settings/template-tools/template-usage-panel";
import { TemplateVersionHistoryPanel } from "@/features/settings/template-tools/template-version-history-panel";

import { EmailTemplateForm } from "../components/email-template-form";
import { EmailTemplatePageHeader } from "../components/email-template-page-header";
import { useEmailTemplate } from "../hooks/use-email-template";
import { useEmailTemplateMutation } from "../hooks/use-email-template-mutation";
import type {
  EmailTemplate,
  EmailTemplateFormValues,
  EmailTemplateVersion,
} from "../types/email-template";

type EmailTemplateEditProps = { id: string };

const toFormValues = (template: EmailTemplate): EmailTemplateFormValues => ({
  body: template.body,
  description: template.description,
  documentKind: template.documentKind,
  isActive: template.isActive,
  isDefault: template.isDefault,
  subject: template.subject,
  templateKey: template.templateKey,
  title: template.title,
});

function toDiffText(value: string | boolean) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (!value) return "-";
  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
}

export function EmailTemplateEdit({ id }: EmailTemplateEditProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const state = useEmailTemplate(id);
  const mutation = useEmailTemplateMutation(id);
  const [usage, setUsage] = useState({ linkedRecords: 0, messageDrafts: 0 });
  const [isUsageLoading, setIsUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState(false);
  const [versions, setVersions] = useState<EmailTemplateVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isVersionsLoading, setIsVersionsLoading] = useState(true);
  const [versionsError, setVersionsError] = useState(false);
  const [rollbackingVersionId, setRollbackingVersionId] = useState<string | null>(null);
  const [rollbackSuccess, setRollbackSuccess] = useState(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [parityReport, setParityReport] = useState<TemplateLocaleParityReport>({
    counterpartKey: null,
    currentLocale: null,
    missingInCounterpart: [],
    missingInCurrent: [],
    status: "unpaired",
  });

  useEffect(() => {
    const controller = new AbortController();
    setIsVersionsLoading(true);
    setVersionsError(false);

    void fetch(`/api/settings/email-templates/${id}/versions`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("email_template_versions_failed");
        return response.json() as Promise<{ data?: EmailTemplateVersion[] }>;
      })
      .then((payload) => {
        const nextVersions = payload.data ?? [];
        setVersions(nextVersions);
        setSelectedVersionId((current) => {
          if (current && nextVersions.some((version) => version.id === current)) return current;
          return nextVersions[0]?.id ?? null;
        });
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") return;
        setVersionsError(true);
      })
      .finally(() => setIsVersionsLoading(false));

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const currentTemplate = state.emailTemplate;
    if (!currentTemplate) return;

    const controller = new AbortController();
    void fetch("/api/settings/email-templates", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("email_templates_list_failed");
        return response.json() as Promise<{ data?: Array<{ body?: string; documentKind?: string; subject?: string; templateKey?: string }> }>;
      })
      .then((payload) => {
        const templates = (payload.data ?? []).map((template) => ({
          scopeKey: template.documentKind ?? "",
          templateKey: template.templateKey ?? "",
          tokens: [
            ...extractTemplateTokenKeys(template.subject ?? ""),
            ...extractTemplateTokenKeys(template.body ?? ""),
          ],
        }));

        setParityReport(
          buildTemplateLocaleParityReport(
            {
              scopeKey: currentTemplate.documentKind,
              templateKey: currentTemplate.templateKey,
              tokens: [
                ...extractTemplateTokenKeys(currentTemplate.subject),
                ...extractTemplateTokenKeys(currentTemplate.body),
              ],
            },
            templates,
          ),
        );
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") return;
      });

    return () => controller.abort();
  }, [state.emailTemplate]);

  useEffect(() => {
    const controller = new AbortController();
    setIsUsageLoading(true);
    setUsageError(false);

    void fetch(`/api/settings/email-templates/${id}/usage`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("email_template_usage_failed");
        return response.json() as Promise<{ data?: { linkedRecords?: number; messageDrafts?: number } }>;
      })
      .then((payload) => {
        setUsage({
          linkedRecords: payload.data?.linkedRecords ?? 0,
          messageDrafts: payload.data?.messageDrafts ?? 0,
        });
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") return;
        setUsageError(true);
      })
      .finally(() => setIsUsageLoading(false));

    return () => controller.abort();
  }, [id]);

  if (state.isLoading) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("settings.emailTemplate.loading")}</main>;
  }

  if (state.hasError || !state.emailTemplate) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("settings.emailTemplate.loadError")}</main>;
  }

  const selectedVersion = selectedVersionId
    ? versions.find((version) => version.id === selectedVersionId) ?? null
    : null;

  const diffRows = selectedVersion
    ? [
      { label: t("settings.emailTemplate.field.title"), currentValue: toDiffText(state.emailTemplate.title), versionValue: toDiffText(selectedVersion.title) },
      { label: t("settings.emailTemplate.field.description"), currentValue: toDiffText(state.emailTemplate.description), versionValue: toDiffText(selectedVersion.description) },
      { label: t("settings.emailTemplate.field.templateKey"), currentValue: toDiffText(state.emailTemplate.templateKey), versionValue: toDiffText(selectedVersion.templateKey) },
      { label: t("settings.emailTemplate.field.documentKind"), currentValue: toDiffText(state.emailTemplate.documentKind), versionValue: toDiffText(selectedVersion.documentKind) },
      { label: t("settings.emailTemplate.field.subject"), currentValue: toDiffText(state.emailTemplate.subject), versionValue: toDiffText(selectedVersion.subject) },
      { label: t("settings.emailTemplate.field.body"), currentValue: toDiffText(state.emailTemplate.body), versionValue: toDiffText(selectedVersion.body) },
      { label: t("settings.emailTemplate.field.active"), currentValue: toDiffText(state.emailTemplate.isActive), versionValue: toDiffText(selectedVersion.isActive) },
      { label: t("settings.emailTemplate.field.isDefault"), currentValue: toDiffText(state.emailTemplate.isDefault), versionValue: toDiffText(selectedVersion.isDefault) },
    ].filter((row) => row.currentValue !== row.versionValue)
    : [];

  const rollbackVersion = async (versionId: string) => {
    setRollbackingVersionId(versionId);
    setRollbackSuccess(false);
    setRollbackError(null);

    try {
      const response = await fetch(`/api/settings/email-templates/${id}/versions/${versionId}/rollback`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("email_template_rollback_failed");

      setRollbackSuccess(true);
      state.reload();

      const versionsResponse = await fetch(`/api/settings/email-templates/${id}/versions`);
      if (versionsResponse.ok) {
        const payload = (await versionsResponse.json()) as { data?: EmailTemplateVersion[] };
        const nextVersions = payload.data ?? [];
        setVersions(nextVersions);
        setSelectedVersionId(nextVersions[0]?.id ?? null);
      }
    } catch {
      setRollbackError(t("common.error"));
    } finally {
      setRollbackingVersionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <EmailTemplatePageHeader backLabel={t("settings.emailTemplate.action.back")} title={t("settings.emailTemplate.edit.title")} />
        <TemplateLocaleParityPanel report={parityReport} t={t} />
        <TemplateUsagePanel
          errorText={t("common.error")}
          hasError={usageError}
          isLoading={isUsageLoading}
          loadingText={t("common.loading")}
          rows={[
            { label: t("settings.templateUsage.field.linkedRecords"), value: usage.linkedRecords },
            { label: t("settings.templateUsage.field.messageDrafts"), value: usage.messageDrafts },
          ]}
          subtitle={t("settings.templateUsage.subtitle")}
          title={t("settings.templateUsage.title")}
        />
        <TemplateVersionHistoryPanel
          diffRows={diffRows}
          hasError={versionsError}
          isLoading={isVersionsLoading}
          onRollback={rollbackVersion}
          onSelectVersion={setSelectedVersionId}
          rollbackError={rollbackError}
          rollbackSuccess={rollbackSuccess}
          rollbackingVersionId={rollbackingVersionId}
          selectedVersionId={selectedVersionId}
          t={t}
          versions={versions.map((version) => ({
            createdAt: version.createdAt,
            id: version.id,
            versionNumber: version.versionNumber,
          }))}
        />
        <EmailTemplateForm
          cancelHref="/settings/email-templates"
          errorKey="settings.emailTemplate.edit.error"
          initialValues={toFormValues(state.emailTemplate)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/email-templates")}
          status={mutation.status}
          submitKey="settings.emailTemplate.action.save"
          successKey="settings.emailTemplate.edit.success"
        />
      </div>
    </main>
  );
}
