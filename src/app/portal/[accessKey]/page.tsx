import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { translations } from "@/core/i18n";
import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { PublicPortalShell } from "@/features/crm/portal/components/public-portal-shell";
import {
  getPublicClientPortalAccess,
  listPublicPortalQuestionnaires,
  listPublicPortalQuotes,
} from "@/features/crm/portal/repositories/client-portal-repository";
import {
  listPublicPortalContracts,
  listPublicPortalInvoices,
} from "@/features/crm/portal/repositories/public-portal-documents-repository";

type PortalPageProps = {
  params: { accessKey: string };
  searchParams?: { tab?: string };
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const metadata: Metadata = {
  title: translations.en["public.portal.heading"],
};

export default async function PortalPage({ params, searchParams }: PortalPageProps) {
  if (!uuidPattern.test(params.accessKey)) notFound();

  const database = await createServerSupabaseClient();
  const portal = await getPublicClientPortalAccess(database, params.accessKey);

  if (!portal) notFound();
  const quotes = portal.quotesVisible
    ? await listPublicPortalQuotes(database, params.accessKey)
    : [];
  const questionnaires = portal.questionnairesVisible
    ? await listPublicPortalQuestionnaires(database, params.accessKey)
    : [];
  const contracts = portal.contractsVisible
    ? await listPublicPortalContracts(database, params.accessKey)
    : [];
  const invoices = portal.invoicesVisible
    ? await listPublicPortalInvoices(database, params.accessKey)
    : [];

  return (
    <PublicPortalShell
      accessKey={params.accessKey}
      initialTab={searchParams?.tab}
      contracts={contracts}
      invoices={invoices}
      portal={portal}
      questionnaires={questionnaires}
      quotes={quotes}
    />
  );
}
