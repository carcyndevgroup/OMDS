import { ClientQuestionnaireDetailPage } from "@/features/crm/client/details/client-questionnaire-detail-page";

type ClientQuestionnaireDetailRouteProps = {
  params: { id: string; questionnaireId: string };
};

export default function ClientQuestionnaireDetailRoute(props: ClientQuestionnaireDetailRouteProps) {
  const { id, questionnaireId } = props.params;
  return <ClientQuestionnaireDetailPage clientId={id} questionnaireId={questionnaireId} />;
}