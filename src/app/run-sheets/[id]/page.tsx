import { EventRunSheetPrintPage } from "@/features/crm/event/details/event-run-sheet-print-page";

type RunSheetPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunSheetPage(props: RunSheetPageProps) {
  const params = await props.params;
  return <EventRunSheetPrintPage id={params.id} />;
}
