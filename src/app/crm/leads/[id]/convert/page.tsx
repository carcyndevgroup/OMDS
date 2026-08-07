import { LeadConversion } from "@/features/crm/client/conversion/lead-conversion";

type ConvertLeadPageProps = {
  params: { id: string };
};

export default function ConvertLeadPage({ params }: ConvertLeadPageProps) {
  return <LeadConversion id={params.id} />;
}
