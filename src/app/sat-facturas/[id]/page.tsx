import { SatFacturaDetail } from "@/features/sat-facturas/components/sat-factura-detail";

type SatFacturaDetailPageProps = {
  params: { id: string };
};

export default function SatFacturaDetailPage({ params }: SatFacturaDetailPageProps) {
  return <SatFacturaDetail facturaId={params.id} />;
}
