import { LeadEdit } from "@/features/crm/lead/edit/lead-edit";

type LeadEditPageProps = {
  params: { id: string };
};

export default function LeadEditPage({ params }: LeadEditPageProps) {
  return <LeadEdit id={params.id} />;
}
