import { SatFacturaWorkflowEdit } from "@/features/sat-facturas/components/sat-factura-workflow-edit";

type SatFacturaWorkflowPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SatFacturaWorkflowPage(props: SatFacturaWorkflowPageProps) {
  const params = await props.params;
  return <SatFacturaWorkflowEdit facturaId={params.id} />;
}
