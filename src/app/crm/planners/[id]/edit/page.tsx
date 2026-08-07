import { PlannerEdit } from "@/features/crm/planner";

type EditPlannerPageProps = { params: { id: string } };

export default function EditPlannerPage({ params }: EditPlannerPageProps) {
  return <PlannerEdit id={params.id} />;
}
