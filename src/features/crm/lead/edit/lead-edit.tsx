"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { LeadFormBody } from "../components/lead-form-body";
import { useLead } from "../hooks/use-lead";
import { useUpdateLead } from "../hooks/use-update-lead";

type LeadEditProps = {
  id: string;
};

export function LeadEdit({ id }: LeadEditProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { hasError, isLoading, lead } = useLead(id);
  const mutation = useUpdateLead(id);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">
        {t("crm.lead.detail.loading")}
      </main>
    );
  }

  if (hasError || !lead) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">
        {t("crm.lead.detail.loadError")}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center gap-3">
          <Link
            aria-label={t("crm.lead.action.back")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            href={`/crm/leads/${id}`}
          >
            <ArrowLeft aria-hidden="true" size={21} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {t("crm.lead.edit.title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {t("crm.lead.edit.subtitle")}
            </p>
          </div>
        </header>

        <LeadFormBody
          errorKey="crm.lead.edit.error"
          initialValues={lead}
          onSubmit={mutation.updateLead}
          onSuccess={() => {
            router.replace(`/crm/leads/${id}`);
            router.refresh();
          }}
          resetStatus={mutation.resetStatus}
          status={mutation.status}
          submitKey="crm.lead.edit.save"
          submittingKey="crm.lead.edit.saving"
          successKey="crm.lead.edit.success"
        />
      </div>
    </main>
  );
}
