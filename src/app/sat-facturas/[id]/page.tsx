import { SatFacturaDetail } from "@/features/sat-facturas/components/sat-factura-detail";

type SatFacturaDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SatFacturaDetailPage(props: SatFacturaDetailPageProps) {
  const params = await props.params;
  return <SatFacturaDetail facturaId={params.id} />;
}
