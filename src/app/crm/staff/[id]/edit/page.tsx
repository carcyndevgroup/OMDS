import { StaffEdit } from "@/features/crm/staff";

type EditStaffPageProps = { params: { id: string } };

export default function EditStaffPage({ params }: EditStaffPageProps) {
  return <StaffEdit id={params.id} />;
}
