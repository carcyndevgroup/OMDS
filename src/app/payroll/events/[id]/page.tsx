import { PayrollEventDetail } from "@/features/payroll/components/payroll-event-detail";

type PayrollEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PayrollEventPage(props: PayrollEventPageProps) {
  const params = await props.params;
  return <PayrollEventDetail eventId={params.id} />;
}
