import { ContractTemplateEdit } from "@/features/settings/contract-template";

type EditContractTemplatePageProps = { params: Promise<{ id: string }> };

export default async function EditContractTemplatePage(props: EditContractTemplatePageProps) {
  const params = await props.params;
  return <ContractTemplateEdit id={params.id} />;
}
