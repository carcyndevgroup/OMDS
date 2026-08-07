import { QuestionnaireTemplateEdit } from "@/features/settings/questionnaire-template";

type EditQuestionnaireTemplatePageProps = { params: { id: string } };

export default function EditQuestionnaireTemplatePage({ params }: EditQuestionnaireTemplatePageProps) {
  return <QuestionnaireTemplateEdit id={params.id} />;
}
