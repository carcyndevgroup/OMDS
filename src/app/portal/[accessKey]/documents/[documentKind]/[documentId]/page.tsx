import Link from "next/link";
import { notFound } from "next/navigation";

import { translations } from "@/core/i18n";
import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { PublicContractDetail } from "@/features/crm/portal/components/public-contract-detail";
import { PublicInvoiceDetail } from "@/features/crm/portal/components/public-invoice-detail";
import { PublicQuestionnaireDetail } from "@/features/crm/portal/components/public-questionnaire-detail";
import { PublicQuoteDetail } from "@/features/crm/portal/components/public-quote-detail";
import { markPublicPortalDocumentViewed } from "@/features/crm/portal/repositories/client-portal-repository";
import {
  listPublicPortalContracts,
  listPublicPortalInvoices,
} from "@/features/crm/portal/repositories/public-portal-documents-repository";
import {
  listPublicPortalQuestionnaires,
  listPublicPortalQuotes,
} from "@/features/crm/portal/repositories/client-portal-repository";

type DocumentKind = "contract" | "invoice" | "questionnaire" | "quote";

type PortalDocumentPageProps = {
  params: Promise<{
    accessKey: string;
    documentId: string;
    documentKind: string;
  }>;
};

const allowedKinds = new Set<DocumentKind>(["contract", "invoice", "questionnaire", "quote"]);

export const metadata = {
  title: translations.en["public.portal.heading"],
};

export default async function PortalDocumentPage(props: PortalDocumentPageProps) {
  const params = await props.params;
  if (!allowedKinds.has(params.documentKind as DocumentKind)) notFound();

  const database = await createServerSupabaseClient();
  const kind = params.documentKind as DocumentKind;

  await markPublicPortalDocumentViewed(database, params.accessKey, kind, params.documentId);

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-10 text-zinc-100">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-100 transition hover:border-cyan-300 hover:text-cyan-200"
          href={`/portal/${params.accessKey}?tab=${tabFor(kind)}`}
        >
          {translations.en["public.portal.action.back"]}
        </Link>
        {kind === "quote" ? <QuoteDetailView accessKey={params.accessKey} documentId={params.documentId} /> : null}
        {kind === "contract" ? <ContractDetailView accessKey={params.accessKey} documentId={params.documentId} /> : null}
        {kind === "invoice" ? <InvoiceDetailView accessKey={params.accessKey} documentId={params.documentId} /> : null}
        {kind === "questionnaire" ? (
          <QuestionnaireDetailView accessKey={params.accessKey} documentId={params.documentId} />
        ) : null}
      </div>
    </main>
  );
}

async function QuoteDetailView(props: { accessKey: string; documentId: string }) {
  const database = await createServerSupabaseClient();
  const quotes = await listPublicPortalQuotes(database, props.accessKey);
  const quote = quotes.find((item) => item.id === props.documentId);
  if (!quote) notFound();
  return <PublicQuoteDetail accessKey={props.accessKey} quote={quote} />;
}

async function ContractDetailView(props: { accessKey: string; documentId: string }) {
  const database = await createServerSupabaseClient();
  const contracts = await listPublicPortalContracts(database, props.accessKey);
  const contract = contracts.find((item) => item.contractId === props.documentId);
  if (!contract) notFound();

  return <PublicContractDetail accessKey={props.accessKey} contract={contract} />;
}

async function InvoiceDetailView(props: { accessKey: string; documentId: string }) {
  const database = await createServerSupabaseClient();
  const invoices = await listPublicPortalInvoices(database, props.accessKey);
  const invoice = invoices.find((item) => item.invoiceId === props.documentId);
  if (!invoice) notFound();
  return <PublicInvoiceDetail accessKey={props.accessKey} invoice={invoice} />;
}

async function QuestionnaireDetailView(props: { accessKey: string; documentId: string }) {
  const database = await createServerSupabaseClient();
  const questionnaires = await listPublicPortalQuestionnaires(database, props.accessKey);
  const questionnaire = questionnaires.find((item) => item.id === props.documentId);
  if (!questionnaire) notFound();
  return <PublicQuestionnaireDetail accessKey={props.accessKey} questionnaire={questionnaire} />;
}

function tabFor(kind: DocumentKind) {
  if (kind === "quote") return "quotes";
  if (kind === "contract") return "contracts";
  if (kind === "invoice") return "invoices";
  return "questionnaires";
}
