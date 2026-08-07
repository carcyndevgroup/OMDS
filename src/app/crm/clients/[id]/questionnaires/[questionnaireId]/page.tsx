import { ClientQuestionnaireDetailPage } from "@/features/crm/client/details/client-questionnaire-detail-page";

type ClientQuestionnaireDetailRouteProps = {
  params: Promise<{ id: string; questionnaireId: string }>;
};

export default async function ClientQuestionnaireDetailRoute(props: ClientQuestionnaireDetailRouteProps) {
  const { id, questionnaireId } = (await props.params);
  return <ClientQuestionnaireDetailPage clientId={id} questionnaireId={questionnaireId} />;
}