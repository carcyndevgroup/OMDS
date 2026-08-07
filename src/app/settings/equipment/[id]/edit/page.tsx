import { EquipmentEdit } from "@/features/settings/equipment";

type EditEquipmentPageProps = { params: Promise<{ id: string }> };

export default async function EditEquipmentPage(props: EditEquipmentPageProps) {
  const params = await props.params;
  return <EquipmentEdit id={params.id} />;
}
