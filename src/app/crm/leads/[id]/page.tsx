import { LeadDetails } from "@/features/crm/lead/details/lead-details";

type LeadDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailsPage(props: LeadDetailsPageProps) {
  const params = await props.params;
  return <LeadDetails id={params.id} />;
}
