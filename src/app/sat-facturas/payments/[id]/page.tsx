import { SatPaymentDetail } from "@/features/sat-facturas/components/sat-payment-detail";

export default async function SatPaymentDetailRoute(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <SatPaymentDetail paymentId={params.id} />;
}
