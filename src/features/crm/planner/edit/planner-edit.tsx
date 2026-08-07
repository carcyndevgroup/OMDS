"use client";

import { useTranslation } from "@/core/i18n";

import { PlannerForm } from "../components/planner-form";
import { PlannerPageHeader } from "../components/planner-page-header";
import { usePlanner } from "../hooks/use-planner";
import { usePlannerMutation } from "../hooks/use-planner-mutation";

type PlannerEditProps = { id: string };

export function PlannerEdit({ id }: PlannerEditProps) {
  const { t } = useTranslation();
  const state = usePlanner(id);
  const mutation = usePlannerMutation(id);

  if (state.isLoading) return <main className="min-h-screen bg-zinc-950 py-12 text-center text-sm text-zinc-500">{t("crm.planner.list.loading")}</main>;
  if (state.hasError || !state.planner) return <main className="min-h-screen bg-zinc-950 py-12 text-center text-sm text-rose-300">{t("crm.planner.list.loadError")}</main>;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <PlannerPageHeader backLabel={t("crm.planner.action.back")} title={t("crm.planner.edit.title")} />
        <PlannerForm
          cancelHref={`/crm/planners/${id}`}
          errorKey="crm.planner.edit.error"
          initialValues={{
            area: state.planner.area,
            city: state.planner.city,
            companyName: state.planner.companyName,
            defaultCommissionModel: state.planner.defaultCommissionModel,
            defaultCommissionPercentage: state.planner.defaultCommissionPercentage?.toString() ?? "",
            email: state.planner.email,
            instagram: state.planner.instagram,
            internalStatus: state.planner.internalStatus,
            name: state.planner.name,
            notes: state.planner.notes,
            phone: state.planner.phone,
            preferredContactMethod: state.planner.preferredContactMethod,
            pvCommissionPolicy: state.planner.pvCommissionPolicy,
            websiteUrl: state.planner.websiteUrl,
            whatsapp: state.planner.whatsapp,
          }}
          onSubmit={mutation.mutate}
          onSuccess={() => window.location.assign(`/crm/planners/${id}`)}
          status={mutation.status}
          submitKey="crm.planner.action.save"
          successKey="crm.planner.edit.success"
        />
      </div>
    </main>
  );
}
