"use client";

import { useTranslation } from "@/core/i18n";

import { PlannerForm } from "../components/planner-form";
import { PlannerPageHeader } from "../components/planner-page-header";
import { usePlannerMutation } from "../hooks/use-planner-mutation";
import { initialPlannerFormValues } from "../schemas/planner-schema";
import type { PlannerFormValues } from "../types/planner";

export function PlannerCreate() {
  const { t } = useTranslation();
  const mutation = usePlannerMutation();
  const createPlanner = async (values: PlannerFormValues) => {
    const planner = await mutation.mutate(values);
    window.location.assign(`/crm/planners/${planner.id}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <PlannerPageHeader
          backLabel={t("crm.planner.action.back")}
          subtitle={t("crm.planner.new.subtitle")}
          title={t("crm.planner.new.title")}
        />
        <PlannerForm
          cancelHref="/crm/planners"
          errorKey="crm.planner.message.createError"
          initialValues={initialPlannerFormValues}
          onSubmit={createPlanner}
          status={mutation.status}
          submitKey="crm.planner.action.create"
          successKey="crm.planner.message.created"
        />
      </div>
    </main>
  );
}
