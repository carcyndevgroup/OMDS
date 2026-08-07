import { InvoicePrintPage } from "@/features/crm/invoice/components/invoice-print-page";

type PageProps = {
  params: {
    eventId: string;
    invoiceId: string;
  };
};

export default function Page({ params }: PageProps) {
  return <InvoicePrintPage eventId={params.eventId} invoiceId={params.invoiceId} />;
}
