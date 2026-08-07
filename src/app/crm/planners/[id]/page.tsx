import { PlannerDetails } from "@/features/crm/planner";

type PlannerPageProps = { params: { id: string } };

export default function PlannerPage({ params }: PlannerPageProps) {
  return <PlannerDetails id={params.id} />;
}
