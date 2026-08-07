import { VenueDetails } from "@/features/crm/venue/details/venue-details";

type VenuePageProps = { params: Promise<{ id: string }> };

export default async function VenuePage(props: VenuePageProps) {
  const params = await props.params;
  return <VenueDetails id={params.id} />;
}
