import { EventRunSheetPrintPage } from "@/features/crm/event/details/event-run-sheet-print-page";

type RunSheetPageProps = {
  params: { id: string };
};

export default function RunSheetPage({ params }: RunSheetPageProps) {
  return <EventRunSheetPrintPage id={params.id} />;
}
