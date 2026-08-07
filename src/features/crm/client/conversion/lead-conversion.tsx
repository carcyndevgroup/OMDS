"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { useLead } from "../../lead/hooks/use-lead";
import { ClientFormBody } from "../components/client-form-body";
import { useConvertLead } from "../hooks/use-convert-lead";
import { leadToClientValues } from "./lead-to-client-values";

type LeadConversionProps = {
  id: string;
};

export function LeadConversion({ id }: LeadConversionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const leadQuery = useLead(id);
  const mutation = useConvertLead(id);

  if (leadQuery.isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">
        {t("crm.lead.detail.loading")}
      </main>
    );
  }

  if (leadQuery.hasError || !leadQuery.lead) {
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
              {t("crm.client.convert.title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {t("crm.client.convert.subtitle")}
            </p>
          </div>
        </header>

        <ClientFormBody
          errorKey="crm.client.convert.error"
          initialValues={leadToClientValues(leadQuery.lead)}
          onSubmit={mutation.convertLead}
          onSuccess={() => {
            router.replace("/crm/leads");
            router.refresh();
          }}
          resetStatus={mutation.resetStatus}
          status={mutation.status}
          submitKey="crm.client.action.convert"
          submittingKey="crm.client.action.converting"
          successKey="crm.client.message.converted"
        />
      </div>
    </main>
  );
}
