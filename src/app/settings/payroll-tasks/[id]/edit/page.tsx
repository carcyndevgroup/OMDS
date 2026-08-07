import { PayrollTaskEdit } from "@/features/settings/payroll-task";

type EditPayrollTaskPageProps = { params: { id: string } };

export default function EditPayrollTaskPage({ params }: EditPayrollTaskPageProps) {
  return <PayrollTaskEdit id={params.id} />;
}
