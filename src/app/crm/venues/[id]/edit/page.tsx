import { VenueEdit } from "@/features/crm/venue/edit/venue-edit";

type EditVenuePageProps = { params: Promise<{ id: string }> };

export default async function EditVenuePage(props: EditVenuePageProps) {
  const params = await props.params;
  return <VenueEdit id={params.id} />;
}
