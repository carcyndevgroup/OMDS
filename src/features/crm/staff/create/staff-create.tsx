"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { StaffForm } from "../components/staff-form";
import { StaffPageHeader } from "../components/staff-page-header";
import { useStaffMutation } from "../hooks/use-staff-mutation";
import { initialStaffFormValues } from "../schemas/staff-schema";

export function StaffCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useStaffMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <StaffPageHeader backLabel={t("crm.staff.action.back")} title={t("crm.staff.new.title")} />
        <StaffForm
          cancelHref="/crm/staff"
          errorKey="crm.staff.message.createError"
          initialValues={initialStaffFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/crm/staff")}
          status={mutation.status}
          submitKey="crm.staff.action.create"
          successKey="crm.staff.message.created"
        />
      </div>
    </main>
  );
}
