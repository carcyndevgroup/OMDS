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

import { ContractTemplateForm } from "../components/contract-template-form";
import { ContractTemplatePageHeader } from "../components/contract-template-page-header";
import { useContractTemplate } from "../hooks/use-contract-template";
import { useContractTemplateMutation } from "../hooks/use-contract-template-mutation";
import type {
  ContractTemplate,
  ContractTemplateFormValues,
  ContractTemplateVersion,
} from "../types/contract-template";

type ContractTemplateEditProps = { id: string };

const toFormValues = (template: ContractTemplate): ContractTemplateFormValues => ({
  body: template.body,
  bookingType: template.bookingType,
  description: template.description,
  eventType: template.eventType,
  isActive: template.isActive,
  isDefault: template.isDefault,
  templateKey: template.templateKey,
  title: template.title,
});

function toDiffText(value: string | boolean) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (!value) return "-";
  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
}

export function ContractTemplateEdit({ id }: ContractTemplateEditProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const state = useContractTemplate(id);
  const mutation = useContractTemplateMutation(id);
  const [usage, setUsage] = useState({ contracts: 0, linkedRecords: 0, quoteVersions: 0 });
  const [isUsageLoading, setIsUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState(false);
  const [versions, setVersions] = useState<ContractTemplateVersion[]>([]);
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

    void fetch(`/api/settings/contract-templates/${id}/versions`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("contract_template_versions_failed");
        return response.json() as Promise<{ data?: ContractTemplateVersion[] }>;
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
    const currentTemplate = state.contractTemplate;
    if (!currentTemplate) return;

    const controller = new AbortController();
    void fetch("/api/settings/contract-templates", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("contract_templates_list_failed");
        return response.json() as Promise<{ data?: Array<{ body?: string; bookingType?: string; eventType?: string; templateKey?: string }> }>;
      })
      .then((payload) => {
        const templates = (payload.data ?? []).map((template) => ({
          scopeKey: `${template.bookingType ?? ""}|${template.eventType ?? ""}`,
          templateKey: template.templateKey ?? "",
          tokens: extractTemplateTokenKeys(template.body ?? ""),
        }));

        setParityReport(
          buildTemplateLocaleParityReport(
            {
              scopeKey: `${currentTemplate.bookingType}|${currentTemplate.eventType}`,
              templateKey: currentTemplate.templateKey,
              tokens: extractTemplateTokenKeys(currentTemplate.body),
            },
            templates,
          ),
        );
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") return;
      });

    return () => controller.abort();
  }, [state.contractTemplate]);

  useEffect(() => {
    const controller = new AbortController();
    setIsUsageLoading(true);
    setUsageError(false);

    void fetch(`/api/settings/contract-templates/${id}/usage`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("contract_template_usage_failed");
        return response.json() as Promise<{ data?: { contracts?: number; linkedRecords?: number; quoteVersions?: number } }>;
      })
      .then((payload) => {
        setUsage({
          contracts: payload.data?.contracts ?? 0,
          linkedRecords: payload.data?.linkedRecords ?? 0,
          quoteVersions: payload.data?.quoteVersions ?? 0,
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
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("settings.contractTemplate.loading")}</main>;
  }

  if (state.hasError || !state.contractTemplate) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("settings.contractTemplate.loadError")}</main>;
  }

  const selectedVersion = selectedVersionId
    ? versions.find((version) => version.id === selectedVersionId) ?? null
    : null;

  const diffRows = selectedVersion
    ? [
      { label: t("settings.contractTemplate.field.title"), currentValue: toDiffText(state.contractTemplate.title), versionValue: toDiffText(selectedVersion.title) },
      { label: t("settings.contractTemplate.field.description"), currentValue: toDiffText(state.contractTemplate.description), versionValue: toDiffText(selectedVersion.description) },
      { label: t("settings.contractTemplate.field.templateKey"), currentValue: toDiffText(state.contractTemplate.templateKey), versionValue: toDiffText(selectedVersion.templateKey) },
      { label: t("settings.contractTemplate.field.bookingType"), currentValue: toDiffText(state.contractTemplate.bookingType), versionValue: toDiffText(selectedVersion.bookingType) },
      { label: t("settings.contractTemplate.field.eventType"), currentValue: toDiffText(state.contractTemplate.eventType), versionValue: toDiffText(selectedVersion.eventType) },
      { label: t("settings.contractTemplate.field.body"), currentValue: toDiffText(state.contractTemplate.body), versionValue: toDiffText(selectedVersion.body) },
      { label: t("settings.contractTemplate.field.active"), currentValue: toDiffText(state.contractTemplate.isActive), versionValue: toDiffText(selectedVersion.isActive) },
      { label: t("settings.contractTemplate.field.isDefault"), currentValue: toDiffText(state.contractTemplate.isDefault), versionValue: toDiffText(selectedVersion.isDefault) },
    ].filter((row) => row.currentValue !== row.versionValue)
    : [];

  const rollbackVersion = async (versionId: string) => {
    setRollbackingVersionId(versionId);
    setRollbackSuccess(false);
    setRollbackError(null);

    try {
      const response = await fetch(`/api/settings/contract-templates/${id}/versions/${versionId}/rollback`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("contract_template_rollback_failed");

      setRollbackSuccess(true);
      state.reload();

      const versionsResponse = await fetch(`/api/settings/contract-templates/${id}/versions`);
      if (versionsResponse.ok) {
        const payload = (await versionsResponse.json()) as { data?: ContractTemplateVersion[] };
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
        <ContractTemplatePageHeader backLabel={t("settings.contractTemplate.action.back")} title={t("settings.contractTemplate.edit.title")} />
        <TemplateLocaleParityPanel report={parityReport} t={t} />
        <TemplateUsagePanel
          errorText={t("common.error")}
          hasError={usageError}
          isLoading={isUsageLoading}
          loadingText={t("common.loading")}
          rows={[
            { label: t("settings.templateUsage.field.linkedRecords"), value: usage.linkedRecords },
            { label: t("settings.templateUsage.field.contracts"), value: usage.contracts },
            { label: t("settings.templateUsage.field.quoteVersions"), value: usage.quoteVersions },
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
        <ContractTemplateForm
          cancelHref="/settings/contract-templates"
          errorKey="settings.contractTemplate.edit.error"
          initialValues={toFormValues(state.contractTemplate)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/contract-templates")}
          status={mutation.status}
          submitKey="settings.contractTemplate.action.save"
          successKey="settings.contractTemplate.edit.success"
        />
      </div>
    </main>
  );
}
