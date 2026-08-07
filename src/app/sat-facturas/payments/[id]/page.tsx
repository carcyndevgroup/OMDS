import { SatPaymentDetail } from "@/features/sat-facturas/components/sat-payment-detail";

export default function SatPaymentDetailRoute({ params }: { params: { id: string } }) {
  return <SatPaymentDetail paymentId={params.id} />;
}
