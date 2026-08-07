import { PlannerEdit } from "@/features/crm/planner";

type EditPlannerPageProps = { params: Promise<{ id: string }> };

export default async function EditPlannerPage(props: EditPlannerPageProps) {
  const params = await props.params;
  return <PlannerEdit id={params.id} />;
}
