import { PaymentPlanEdit } from "@/features/settings/payment-plan";

type EditPaymentPlanPageProps = { params: { id: string } };

export default function EditPaymentPlanPage({ params }: EditPaymentPlanPageProps) {
  return <PaymentPlanEdit id={params.id} />;
}
