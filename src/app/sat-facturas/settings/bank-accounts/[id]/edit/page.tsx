import { SatBankAccountEdit } from "@/features/sat-facturas/components/sat-bank-account-edit";

type EditSatBankAccountPageProps = { params: { id: string } };

export default function EditSatBankAccountPage({
  params,
}: EditSatBankAccountPageProps) {
  return <SatBankAccountEdit accountId={params.id} />;
}
