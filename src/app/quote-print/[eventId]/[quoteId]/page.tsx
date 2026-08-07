import { QuotePrintPage } from "@/features/crm/quote/components/quote-print-page";

type PageProps = {
  params: {
    eventId: string;
    quoteId: string;
  };
};

export default function Page({ params }: PageProps) {
  return <QuotePrintPage eventId={params.eventId} quoteId={params.quoteId} />;
}
