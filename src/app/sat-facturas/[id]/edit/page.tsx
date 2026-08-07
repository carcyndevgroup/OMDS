import { SatFacturaEdit } from "@/features/sat-facturas/components/sat-factura-edit";

type SatFacturaEditPageProps = {
  params: { id: string };
};

export default function SatFacturaEditPage({ params }: SatFacturaEditPageProps) {
  return <SatFacturaEdit facturaId={params.id} />;
}
