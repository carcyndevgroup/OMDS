import { SatFacturaEdit } from "@/features/sat-facturas/components/sat-factura-edit";

type SatFacturaEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SatFacturaEditPage(props: SatFacturaEditPageProps) {
  const params = await props.params;
  return <SatFacturaEdit facturaId={params.id} />;
}
