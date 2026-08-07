import { ClientContractDetailPage } from "@/features/crm/client/details/client-contract-detail-page";

type ClientContractDetailRouteProps = {
  params: Promise<{ contractId: string; id: string }>;
};

export default async function ClientContractDetailRoute(props: ClientContractDetailRouteProps) {
  const { contractId, id } = (await props.params);
  return <ClientContractDetailPage clientId={id} contractId={contractId} />;
}