import { SatBankAccountEdit } from "@/features/sat-facturas/components/sat-bank-account-edit";

type EditSatBankAccountPageProps = { params: Promise<{ id: string }> };

export default async function EditSatBankAccountPage(props: EditSatBankAccountPageProps) {
  const params = await props.params;
  return <SatBankAccountEdit accountId={params.id} />;
}
