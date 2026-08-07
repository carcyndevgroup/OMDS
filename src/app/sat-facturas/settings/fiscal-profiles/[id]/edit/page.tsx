import { SatFiscalProfileEdit } from "@/features/sat-facturas/components/sat-fiscal-profile-edit";

type EditSatFiscalProfilePageProps = { params: Promise<{ id: string }> };

export default async function EditSatFiscalProfilePage(props: EditSatFiscalProfilePageProps) {
  const params = await props.params;
  return <SatFiscalProfileEdit profileId={params.id} />;
}
