"use client";

import { useTranslation } from "@/core/i18n";

import { formatPhone } from "../../shared/utils/phone-format";
import { PlannerPageHeader } from "../components/planner-page-header";
import {
  plannerCommissionModelOptions,
  plannerContactMethodOptions,
  pvCommissionPolicyOptions,
} from "../constants/planner-options";
import { usePlanner } from "../hooks/use-planner";
import { PlannerEventsSection } from "./planner-events-section";

type PlannerDetailsProps = { id: string };
type DetailItemProps = { label: string; value: string | number | null };

function DetailItem({ label, value }: DetailItemProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <dt className="text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="font-semibold text-zinc-200">{value || t("common.notProvided")}</dd>
    </div>
  );
}

export function PlannerDetails({ id }: PlannerDetailsProps) {
  const { t } = useTranslation();
  const state = usePlanner(id);

  if (state.isLoading) return <main className="min-h-screen bg-zinc-950 py-12 text-center text-sm text-zinc-500">{t("crm.planner.list.loading")}</main>;
  if (state.hasError || !state.planner) return <main className="min-h-screen bg-zinc-950 py-12 text-center text-sm text-rose-300">{t("crm.planner.list.loadError")}</main>;

  const planner = state.planner;
  const method = plannerContactMethodOptions.find((item) => item.value === planner.preferredContactMethod);
  const commission = plannerCommissionModelOptions.find((item) => item.value === planner.defaultCommissionModel);
  const pvPolicy = pvCommissionPolicyOptions.find((item) => item.value === planner.pvCommissionPolicy);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <PlannerPageHeader
          backLabel={t("crm.planner.action.back")}
          editHref={`/crm/planners/${id}/edit`}
          editLabel={t("crm.planner.action.edit")}
          title={planner.name}
        />
        <section className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/20">
          <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
            <h2 className="text-xl font-bold">{t("crm.planner.detail.profile")}</h2>
          </div>
          <dl className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
            <DetailItem label={t("crm.planner.field.name")} value={planner.name} />
            <DetailItem label={t("crm.planner.field.companyName")} value={planner.companyName} />
            <DetailItem label={t("crm.planner.field.email")} value={planner.email} />
            <DetailItem label={t("crm.planner.field.phone")} value={planner.phone ? formatPhone(planner.phone) : ""} />
            <DetailItem label={t("crm.planner.field.whatsapp")} value={planner.whatsapp ? formatPhone(planner.whatsapp) : ""} />
            <DetailItem label={t("crm.planner.field.instagram")} value={planner.instagram} />
            <DetailItem label={t("crm.planner.field.websiteUrl")} value={planner.websiteUrl} />
            <DetailItem label={t("crm.planner.field.preferredMethod")} value={method ? t(method.translationKey) : ""} />
            <DetailItem label={t("crm.planner.field.city")} value={planner.city} />
            <DetailItem label={t("crm.planner.field.status")} value={t(planner.internalStatus === "active" ? "crm.planner.status.active" : "crm.planner.status.inactive")} />
          </dl>
        </section>
        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6">
          <h2 className="text-xl font-bold">{t("crm.planner.detail.settings")}</h2>
          <dl className="mt-5 grid gap-5 md:grid-cols-2">
            <DetailItem label={t("crm.planner.field.commissionModel")} value={commission ? t(commission.translationKey) : ""} />
            <DetailItem label={t("crm.planner.field.commissionPercentage")} value={planner.defaultCommissionPercentage} />
            <DetailItem label={t("crm.planner.field.pvPolicy")} value={pvPolicy ? t(pvPolicy.translationKey) : ""} />
            <DetailItem label={t("crm.planner.field.notes")} value={planner.notes} />
          </dl>
        </section>
        <PlannerEventsSection plannerId={planner.id} />
      </div>
    </main>
  );
}
