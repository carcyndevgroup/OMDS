import { PayrollTaskEdit } from "@/features/settings/payroll-task";

type EditPayrollTaskPageProps = { params: Promise<{ id: string }> };

export default async function EditPayrollTaskPage(props: EditPayrollTaskPageProps) {
  const params = await props.params;
  return <PayrollTaskEdit id={params.id} />;
}
