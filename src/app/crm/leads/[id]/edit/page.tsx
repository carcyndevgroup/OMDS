import { LeadEdit } from "@/features/crm/lead/edit/lead-edit";

type LeadEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadEditPage(props: LeadEditPageProps) {
  const params = await props.params;
  return <LeadEdit id={params.id} />;
}
