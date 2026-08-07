import { QuotePrintPage } from "@/features/crm/quote/components/quote-print-page";

type PageProps = {
  params: Promise<{
    eventId: string;
    quoteId: string;
  }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;
  return <QuotePrintPage eventId={params.eventId} quoteId={params.quoteId} />;
}
