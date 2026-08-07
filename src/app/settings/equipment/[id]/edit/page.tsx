import { EquipmentEdit } from "@/features/settings/equipment";

type EditEquipmentPageProps = { params: { id: string } };

export default function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  return <EquipmentEdit id={params.id} />;
}
