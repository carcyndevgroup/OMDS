"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { StaffForm } from "../components/staff-form";
import { StaffPageHeader } from "../components/staff-page-header";
import { useStaff } from "../hooks/use-staff";
import { useStaffMutation } from "../hooks/use-staff-mutation";
import type { StaffFormValues } from "../types/staff";

type StaffEditProps = { id: string };

const toFormValues = (staff: NonNullable<ReturnType<typeof useStaff>["staff"]>): StaffFormValues => ({
  address: staff.address,
  bankAccountNumber: staff.bankAccountNumber,
  bankBeneficiary: staff.bankBeneficiary,
  bankCardNumber: staff.bankCardNumber,
  bankClabe: staff.bankClabe,
  bankName: staff.bankName,
  dateOfBirth: staff.dateOfBirth,
  displayName: staff.displayName,
  email: staff.email,
  idBackFileUrl: staff.idBackFileUrl,
  idExpirationDate: staff.idExpirationDate,
  idFrontFileUrl: staff.idFrontFileUrl,
  idNumber: staff.idNumber,
  idType: staff.idType,
  isActive: staff.isActive,
  isDriver: staff.isDriver,
  name: staff.name,
  notes: staff.notes,
  phone: staff.phone,
});

export function StaffEdit({ id }: StaffEditProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const state = useStaff(id);
  const mutation = useStaffMutation(id);

  if (state.isLoading) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("crm.staff.list.loading")}</main>;
  }

  if (state.hasError || !state.staff) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("crm.staff.list.loadError")}</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <StaffPageHeader backLabel={t("crm.staff.action.back")} title={t("crm.staff.edit.title")} />
        <StaffForm
          cancelHref="/crm/staff"
          errorKey="crm.staff.edit.error"
          initialValues={toFormValues(state.staff)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/crm/staff")}
          status={mutation.status}
          submitKey="crm.staff.action.save"
          successKey="crm.staff.edit.success"
        />
      </div>
    </main>
  );
}
