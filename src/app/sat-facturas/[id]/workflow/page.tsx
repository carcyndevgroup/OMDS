import { SatFacturaWorkflowEdit } from "@/features/sat-facturas/components/sat-factura-workflow-edit";

type SatFacturaWorkflowPageProps = {
  params: { id: string };
};

export default function SatFacturaWorkflowPage({ params }: SatFacturaWorkflowPageProps) {
  return <SatFacturaWorkflowEdit facturaId={params.id} />;
}
