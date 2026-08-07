import { QuestionnaireFieldCatalogEdit } from "@/features/settings/questionnaire-template/catalog/edit/questionnaire-field-catalog-edit";

type EditQuestionnaireFieldCatalogPageProps = { params: Promise<{ id: string }> };

export default async function EditQuestionnaireFieldCatalogPage(props: EditQuestionnaireFieldCatalogPageProps) {
  const params = await props.params;
  return <QuestionnaireFieldCatalogEdit id={params.id} />;
}
