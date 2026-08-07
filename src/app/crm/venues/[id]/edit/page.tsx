import { VenueEdit } from "@/features/crm/venue/edit/venue-edit";

type EditVenuePageProps = { params: { id: string } };

export default function EditVenuePage({ params }: EditVenuePageProps) {
  return <VenueEdit id={params.id} />;
}
