import { PayrollEventDetail } from "@/features/payroll/components/payroll-event-detail";

type PayrollEventPageProps = {
  params: {
    id: string;
  };
};

export default function PayrollEventPage({ params }: PayrollEventPageProps) {
  return <PayrollEventDetail eventId={params.id} />;
}
