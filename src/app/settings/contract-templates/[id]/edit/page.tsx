import { ContractTemplateEdit } from "@/features/settings/contract-template";

type EditContractTemplatePageProps = { params: { id: string } };

export default function EditContractTemplatePage({ params }: EditContractTemplatePageProps) {
  return <ContractTemplateEdit id={params.id} />;
}
