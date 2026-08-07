"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { EquipmentForm } from "../components/equipment-form";
import { EquipmentPageHeader } from "../components/equipment-page-header";
import { useEquipmentMutation } from "../hooks/use-equipment-mutation";
import { initialEquipmentFormValues } from "../schemas/equipment-schema";

export function EquipmentCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useEquipmentMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <EquipmentPageHeader backLabel={t("settings.equipment.action.back")} title={t("settings.equipment.new.title")} />
        <EquipmentForm
          cancelHref="/settings/equipment"
          errorKey="settings.equipment.message.createError"
          initialValues={initialEquipmentFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/equipment")}
          status={mutation.status}
          submitKey="settings.equipment.action.create"
          successKey="settings.equipment.message.created"
        />
      </div>
    </main>
  );
}
