import { PaymentPlanEdit } from "@/features/settings/payment-plan";

type EditPaymentPlanPageProps = { params: Promise<{ id: string }> };

export default async function EditPaymentPlanPage(props: EditPaymentPlanPageProps) {
  const params = await props.params;
  return <PaymentPlanEdit id={params.id} />;
}
