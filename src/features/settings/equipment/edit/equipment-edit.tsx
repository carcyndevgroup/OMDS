"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { EquipmentForm } from "../components/equipment-form";
import { EquipmentPageHeader } from "../components/equipment-page-header";
import { useEquipment } from "../hooks/use-equipment";
import { useEquipmentMutation } from "../hooks/use-equipment-mutation";
import type { EquipmentFormValues } from "../types/equipment";

type EquipmentEditProps = { id: string };

const toFormValues = (equipment: NonNullable<ReturnType<typeof useEquipment>["equipment"]>): EquipmentFormValues => ({
  category: equipment.category,
  isActive: equipment.isActive,
  name: equipment.name,
  notes: equipment.notes,
});

export function EquipmentEdit({ id }: EquipmentEditProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const state = useEquipment(id);
  const mutation = useEquipmentMutation(id);

  if (state.isLoading) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("settings.equipment.loading")}</main>;
  }

  if (state.hasError || !state.equipment) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("settings.equipment.loadError")}</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <EquipmentPageHeader backLabel={t("settings.equipment.action.back")} title={t("settings.equipment.edit.title")} />
        <EquipmentForm
          cancelHref="/settings/equipment"
          errorKey="settings.equipment.edit.error"
          initialValues={toFormValues(state.equipment)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/equipment")}
          status={mutation.status}
          submitKey="settings.equipment.action.save"
          successKey="settings.equipment.edit.success"
        />
      </div>
    </main>
  );
}
