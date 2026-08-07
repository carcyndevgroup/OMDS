"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { useEquipmentList } from "@/features/settings/equipment/hooks/use-equipment-list";

import { useEventEquipment } from "../../equipment/hooks/use-event-equipment";
import { useEventEquipmentMutation } from "../../equipment/hooks/use-event-equipment-mutation";
import type { EventEquipmentFormValues } from "../../equipment/types/event-equipment";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { equipmentCategoryOptions } from "@/features/settings/equipment/constants/equipment-options";
import { EventDetailSection } from "./event-detail-section";
import type { EventDetailSectionProps } from "./event-detail-types";

export function EventEquipmentTab({ event, t }: EventDetailSectionProps) {
  const catalog = useEquipmentList();
  const eventEquipment = useEventEquipment(event.eventId);
  const mutation = useEventEquipmentMutation(event.eventId);
  const [values, setValues] = useState<EventEquipmentFormValues>({
    equipmentId: "",
    notes: "",
  });

  const save = async () => {
    if (!values.equipmentId) return;
    await mutation.upsert(values);
    setValues({ equipmentId: "", notes: "" });
    await eventEquipment.refresh();
  };

  const remove = async (assignmentId: string) => {
    await mutation.remove(assignmentId);
    await eventEquipment.refresh();
  };

  return (
    <EventDetailSection title={t("crm.event.equipment.title")}>
      <div className="space-y-6">
        <CrmSelect
          label={t("crm.event.equipment.field.equipment")}
          onChange={(value) => setValues((current) => ({ ...current, equipmentId: value }))}
          options={catalog.equipment.filter((item) => item.isActive).map((item) => ({
            label: item.name,
            value: item.id,
          }))}
          placeholderKey="crm.event.equipment.placeholder.equipment"
          t={t}
          value={values.equipmentId}
        />
        <CrmTextarea
          label={t("crm.event.equipment.field.notes")}
          onChange={(value) => setValues((current) => ({ ...current, notes: value }))}
          placeholder={t("crm.event.equipment.placeholder.notes")}
          t={t}
          value={values.notes}
        />
        <button className="h-11 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={save} type="button">
          {t("crm.event.equipment.action.save")}
        </button>

        {eventEquipment.isLoading || catalog.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.event.equipment.loading")}</p>
        ) : null}
        {eventEquipment.hasError || catalog.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.event.equipment.loadError")}</p>
        ) : null}
        {!eventEquipment.isLoading && !eventEquipment.assignments.length ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">{t("crm.event.equipment.empty")}</p>
        ) : null}
        <div className="grid gap-3">
          {eventEquipment.assignments.map((assignment) => {
            const categoryKey = equipmentCategoryOptions.find((option) => {
              return option.value === assignment.equipmentCategory;
            })?.translationKey;
            return (
              <article className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-4 sm:flex-row sm:items-center sm:justify-between" key={assignment.id}>
                <div>
                  <p className="font-bold text-cyan-200">{assignment.equipmentName}</p>
                  {categoryKey ? <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{t(categoryKey)}</p> : null}
                  {assignment.notes ? <p className="mt-2 text-sm text-zinc-500">{assignment.notes}</p> : null}
                </div>
                <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => remove(assignment.id)} type="button">
                  <Trash2 aria-hidden="true" size={16} />
                  {t("crm.event.equipment.action.remove")}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </EventDetailSection>
  );
}
