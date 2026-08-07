import { QuestionnaireTemplateEdit } from "@/features/settings/questionnaire-template";

type EditQuestionnaireTemplatePageProps = { params: Promise<{ id: string }> };

export default async function EditQuestionnaireTemplatePage(props: EditQuestionnaireTemplatePageProps) {
  const params = await props.params;
  return <QuestionnaireTemplateEdit id={params.id} />;
}
