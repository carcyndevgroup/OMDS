import { PlannerDetails } from "@/features/crm/planner";

type PlannerPageProps = { params: Promise<{ id: string }> };

export default async function PlannerPage(props: PlannerPageProps) {
  const params = await props.params;
  return <PlannerDetails id={params.id} />;
}
