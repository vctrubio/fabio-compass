import { EventCard } from '@/rails/view/card/EventCard';

interface KiteEventFromBooking {
  id: string;
  lesson_id: string;
  date: string;
  duration: number;
  location: string;
  status: string;
  trigger_transaction: boolean;
  created_at?: string;
  lesson: any;
  booking: any;
  students: Array<{
    id: string;
    name: string;
  }>;
}

interface AdminEventsProps {
  events: KiteEventFromBooking[];
  selectedDate: string | null;
}

export default function AdminEvents({ events, selectedDate }: AdminEventsProps) {
  // Transform kite events to match EventCard interface
  const transformedEvents = events.map(kiteEvent => ({
    id: kiteEvent.id,
    time: new Date(kiteEvent.date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    duration: kiteEvent.duration,
    date: kiteEvent.date,
    status: kiteEvent.status,
    location: kiteEvent.location,
    students: kiteEvent.students
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Kite Events ({events.length})</h2>
      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {selectedDate 
              ? `No kite events found for ${new Date(selectedDate).toLocaleDateString()}`
              : 'No kite events found.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transformedEvents.map((event) => (
            <EventCard key={event.id} event={event} showDropdown={false} />
          ))}
        </div>
      )}
    </div>
  );
}