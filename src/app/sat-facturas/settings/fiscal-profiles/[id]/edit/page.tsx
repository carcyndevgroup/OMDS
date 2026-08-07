import { SatFiscalProfileEdit } from "@/features/sat-facturas/components/sat-fiscal-profile-edit";

type EditSatFiscalProfilePageProps = { params: { id: string } };

export default function EditSatFiscalProfilePage({
  params,
}: EditSatFiscalProfilePageProps) {
  return <SatFiscalProfileEdit profileId={params.id} />;
}
