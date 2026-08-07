"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { formatPhone } from "../../shared/utils/phone-format";
import { eventStaffPositionOptions } from "../../staff/constants/staff-options";
import { useEventStaff } from "../../staff/hooks/use-event-staff";
import { useEventStaffMutation } from "../../staff/hooks/use-event-staff-mutation";
import { useStaffList } from "../../staff/hooks/use-staff-list";
import type { EventStaffFormValues, StaffPosition } from "../../staff/types/staff";
import { EventDetailSection } from "./event-detail-section";
import type { EventDetailSectionProps } from "./event-detail-types";

export function EventStaffingTab({ event, t }: EventDetailSectionProps) {
  const staff = useStaffList();
  const eventStaff = useEventStaff(event.eventId);
  const mutation = useEventStaffMutation(event.eventId);
  const [values, setValues] = useState<EventStaffFormValues>({
    notes: "",
    position: "",
    staffMemberId: "",
  });

  const save = async () => {
    if (!values.position || !values.staffMemberId) return;
    await mutation.upsert(values);
    setValues({ notes: "", position: "", staffMemberId: "" });
    await eventStaff.refresh();
  };

  const remove = async (assignmentId: string) => {
    await mutation.remove(assignmentId);
    await eventStaff.refresh();
  };

  return (
    <EventDetailSection title={t("crm.staff.event.title")}>
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <CrmSelect
            label={t("crm.staff.event.field.position")}
            onChange={(value) => setValues((current) => ({ ...current, position: value as StaffPosition | "" }))}
            options={eventStaffPositionOptions}
            placeholderKey="crm.staff.event.placeholder.position"
            t={t}
            value={values.position}
          />
          <CrmSelect
            label={t("crm.staff.event.field.staff")}
            onChange={(value) => setValues((current) => ({ ...current, staffMemberId: value }))}
            options={staff.staff.filter((member) => member.isActive).map((member) => ({
              label: member.displayName || member.name,
              value: member.id,
            }))}
            placeholderKey="crm.staff.event.placeholder.staff"
            t={t}
            value={values.staffMemberId}
          />
        </div>
        <CrmTextarea
          label={t("crm.staff.event.field.notes")}
          onChange={(value) => setValues((current) => ({ ...current, notes: value }))}
          placeholder={t("crm.staff.event.placeholder.notes")}
          t={t}
          value={values.notes}
        />
        <button className="h-11 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={save} type="button">
          {t("crm.staff.event.action.save")}
        </button>

        {eventStaff.isLoading || staff.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.staff.event.loading")}</p>
        ) : null}
        {eventStaff.hasError || staff.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.staff.event.loadError")}</p>
        ) : null}
        {!eventStaff.isLoading && !eventStaff.assignments.length ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">{t("crm.staff.event.empty")}</p>
        ) : null}
        <div className="grid gap-3">
          {eventStaff.assignments.map((assignment) => {
            const positionKey = eventStaffPositionOptions.find((option) => option.value === assignment.position)?.translationKey;
            return (
              <article className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-4 sm:flex-row sm:items-center sm:justify-between" key={assignment.id}>
                <div>
                  <p className="font-bold text-cyan-200">{positionKey ? t(positionKey) : assignment.position}</p>
                  <p className="mt-1 text-sm text-zinc-300">{assignment.staffName}</p>
                  <p className="mt-1 text-sm text-zinc-500">{formatPhone(assignment.staffPhone)}</p>
                </div>
                <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => remove(assignment.id)} type="button">
                  <Trash2 aria-hidden="true" size={16} />
                  {t("crm.staff.event.action.remove")}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </EventDetailSection>
  );
}
