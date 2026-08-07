import { QuestionnaireFieldCatalogEdit } from "@/features/settings/questionnaire-template/catalog/edit/questionnaire-field-catalog-edit";

type EditQuestionnaireFieldCatalogPageProps = { params: { id: string } };

export default function EditQuestionnaireFieldCatalogPage({ params }: EditQuestionnaireFieldCatalogPageProps) {
  return <QuestionnaireFieldCatalogEdit id={params.id} />;
}
