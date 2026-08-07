import { PayrollPaymentDetail } from "@/features/payroll/components/payroll-payment-detail";

type PayrollPaymentPageProps = {
  params: {
    id: string;
  };
};

export default function PayrollPaymentPage({ params }: PayrollPaymentPageProps) {
  return <PayrollPaymentDetail paymentId={params.id} />;
}
