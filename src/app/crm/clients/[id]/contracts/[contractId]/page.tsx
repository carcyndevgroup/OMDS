import { ClientContractDetailPage } from "@/features/crm/client/details/client-contract-detail-page";

type ClientContractDetailRouteProps = {
  params: { contractId: string; id: string };
};

export default function ClientContractDetailRoute(props: ClientContractDetailRouteProps) {
  const { contractId, id } = props.params;
  return <ClientContractDetailPage clientId={id} contractId={contractId} />;
}