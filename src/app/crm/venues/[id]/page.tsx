import { VenueDetails } from "@/features/crm/venue/details/venue-details";

type VenuePageProps = { params: { id: string } };

export default function VenuePage({ params }: VenuePageProps) {
  return <VenueDetails id={params.id} />;
}
