import { EventDetails } from "@/features/crm/event";

type EventPageProps = { params: { id: string } };

export default function EventPage({ params }: EventPageProps) {
  return <EventDetails id={params.id} />;
}
