"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useEventPlannerMutation } from "../../planner/hooks/use-event-planner-mutation";
import { useEventPlanners } from "../../planner/hooks/use-event-planners";
import {
  initialEventPlannerFormValues,
  validateEventPlannerForm,
  type EventPlannerFormErrors,
} from "../../planner/schemas/event-planner-schema";
import type {
  EventPlanner,
  EventPlannerFormValues,
} from "../../planner/types/event-planner";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";
import { EventPlannerCard } from "./event-planner-card";
import { EventPlannerForm } from "./event-planner-form";

const toFormValues = (eventPlanner: EventPlanner): EventPlannerFormValues => ({
  commissionEligible: eventPlanner.commissionEligible,
  commissionPercentageOverride:
    eventPlanner.commissionPercentageOverride?.toString() ?? "",
  isPrimary: eventPlanner.isPrimary,
  notes: eventPlanner.notes,
  plannerId: eventPlanner.plannerId,
  role: eventPlanner.role,
});

export function EventPlannersSection({ client, t }: ClientDetailSectionProps) {
  const eventId = client.event?.id ?? null;
  const state = useEventPlanners(eventId);
  const [values, setValues] = useState(initialEventPlannerFormValues);
  const [errors, setErrors] = useState<EventPlannerFormErrors>({});
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<EventPlanner | null>(null);
  const createMutation = useEventPlannerMutation(eventId ?? "");
  const updateMutation = useEventPlannerMutation(eventId ?? "", editing?.id);

  const setField = <TKey extends keyof EventPlannerFormValues>(
    key: TKey,
    value: EventPlannerFormValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const reset = () => {
    setValues(initialEventPlannerFormValues);
    setErrors({});
    setIsAdding(false);
    setEditing(null);
  };

  const submit = async () => {
    const validation = validateEventPlannerForm(values);
    setErrors(validation.errors);
    if (!validation.isValid || !eventId) return;

    if (editing) await updateMutation.mutate(values);
    else await createMutation.mutate(values);

    reset();
    await state.refresh();
  };

  const edit = (eventPlanner: EventPlanner) => {
    setEditing(eventPlanner);
    setIsAdding(false);
    setValues(toFormValues(eventPlanner));
  };

  const remove = async (eventPlanner: EventPlanner) => {
    if (!eventId) return;
    const response = await fetch(`/api/crm/events/${eventId}/planners/${eventPlanner.id}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    await state.refresh();
  };

  return (
    <ClientDetailSection title={t("crm.client.detail.section.planners")}>
      {!eventId ? (
        <p className="text-sm text-zinc-500">{t("crm.client.detail.empty.event")}</p>
      ) : (
        <div className="space-y-5">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" onClick={() => { setIsAdding(true); setEditing(null); setValues(initialEventPlannerFormValues); }} type="button">
            <Plus aria-hidden="true" size={16} />
            {t("crm.client.planner.action.add")}
          </button>

          {isAdding || editing ? (
            <EventPlannerForm
              errors={errors}
              onCancel={reset}
              onChange={setField}
              onSubmit={submit}
              submitLabel={t(editing ? "crm.client.planner.action.update" : "crm.client.planner.action.save")}
              t={t}
              values={values}
            />
          ) : null}

          {state.isLoading ? <p className="text-sm text-zinc-500">{t("crm.client.planner.loading")}</p> : null}
          {state.hasError ? <p className="text-sm text-rose-300">{t("crm.client.planner.loadError")}</p> : null}
          {!state.isLoading && state.eventPlanners.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">{t("crm.client.planner.empty")}</p>
          ) : null}
          <div className="grid gap-4">
            {state.eventPlanners.map((eventPlanner) => (
              <EventPlannerCard
                eventPlanner={eventPlanner}
                key={eventPlanner.id}
                onEdit={edit}
                onRemove={remove}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </ClientDetailSection>
  );
}
