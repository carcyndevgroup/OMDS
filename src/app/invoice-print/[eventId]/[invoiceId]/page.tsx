import { InvoicePrintPage } from "@/features/crm/invoice/components/invoice-print-page";

type PageProps = {
  params: Promise<{
    eventId: string;
    invoiceId: string;
  }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;
  return <InvoicePrintPage eventId={params.eventId} invoiceId={params.invoiceId} />;
}
