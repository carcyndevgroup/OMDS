import { StaffEdit } from "@/features/crm/staff";

type EditStaffPageProps = { params: Promise<{ id: string }> };

export default async function EditStaffPage(props: EditStaffPageProps) {
  const params = await props.params;
  return <StaffEdit id={params.id} />;
}
