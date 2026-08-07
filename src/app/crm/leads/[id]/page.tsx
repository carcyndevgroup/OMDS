import { LeadDetails } from "@/features/crm/lead/details/lead-details";

type LeadDetailsPageProps = {
  params: { id: string };
};

export default function LeadDetailsPage({ params }: LeadDetailsPageProps) {
  return <LeadDetails id={params.id} />;
}
