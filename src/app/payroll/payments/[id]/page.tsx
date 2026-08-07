import { PayrollPaymentDetail } from "@/features/payroll/components/payroll-payment-detail";

type PayrollPaymentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PayrollPaymentPage(props: PayrollPaymentPageProps) {
  const params = await props.params;
  return <PayrollPaymentDetail paymentId={params.id} />;
}
