import { LeadConversion } from "@/features/crm/client/conversion/lead-conversion";

type ConvertLeadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConvertLeadPage(props: ConvertLeadPageProps) {
  const params = await props.params;
  return <LeadConversion id={params.id} />;
}
