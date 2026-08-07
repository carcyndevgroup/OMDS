import { EventDetails } from "@/features/crm/event";

type EventPageProps = { params: Promise<{ id: string }> };

export default async function EventPage(props: EventPageProps) {
  const params = await props.params;
  return <EventDetails id={params.id} />;
}
