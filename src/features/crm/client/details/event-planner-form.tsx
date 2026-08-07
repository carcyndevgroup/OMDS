"use client";

import { Save } from "lucide-react";
import type { FormEvent } from "react";

import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import type { Translate } from "../../shared/types/form-types";
import { eventPlannerRoleOptions } from "../../planner/constants/event-planner-options";
import { usePlannerList } from "../../planner/hooks/use-planner-list";
import type { EventPlannerFormValues } from "../../planner/types/event-planner";
import type { EventPlannerFormErrors } from "../../planner/schemas/event-planner-schema";

type EventPlannerFormProps = {
  errors: EventPlannerFormErrors;
  onCancel: () => void;
  onChange: <TKey extends keyof EventPlannerFormValues>(
    key: TKey,
    value: EventPlannerFormValues[TKey],
  ) => void;
  onSubmit: () => Promise<void>;
  submitLabel: string;
  t: Translate;
  values: EventPlannerFormValues;
};

export function EventPlannerForm(props: EventPlannerFormProps) {
  const planners = usePlannerList();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await props.onSubmit();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-950/50 p-5" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmSelect
          error={props.errors.plannerId}
          label={props.t("crm.client.planner.field.planner")}
          onChange={(value) => props.onChange("plannerId", value)}
          options={planners.planners.map((planner) => ({ label: planner.name, value: planner.id }))}
          t={props.t}
          value={props.values.plannerId}
        />
        <CrmSelect
          error={props.errors.role}
          label={props.t("crm.client.planner.field.role")}
          onChange={(value) => props.onChange("role", value)}
          options={eventPlannerRoleOptions}
          t={props.t}
          value={props.values.role}
        />
        <CrmTextInput
          label={props.t("crm.client.planner.field.commissionOverride")}
          onChange={(value) => props.onChange("commissionPercentageOverride", value)}
          t={props.t}
          type="number"
          value={props.values.commissionPercentageOverride}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={props.values.isPrimary} className="h-4 w-4 accent-cyan-300" onChange={(event) => props.onChange("isPrimary", event.target.checked)} type="checkbox" />
          {props.t("crm.client.planner.field.primary")}
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={props.values.commissionEligible} className="h-4 w-4 accent-cyan-300" onChange={(event) => props.onChange("commissionEligible", event.target.checked)} type="checkbox" />
          {props.t("crm.client.planner.field.commissionEligible")}
        </label>
      </div>
      <CrmTextarea label={props.t("crm.client.planner.field.notes")} onChange={(value) => props.onChange("notes", value)} placeholder={props.t("crm.client.planner.placeholder.notes")} t={props.t} value={props.values.notes} />
      <div className="flex justify-end gap-3">
        <button className="h-10 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" onClick={props.onCancel} type="button">
          {props.t("crm.client.planner.action.cancel")}
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" type="submit">
          <Save aria-hidden="true" size={15} />
          {props.submitLabel}
        </button>
      </div>
    </form>
  );
}
