"use client";

import { useState } from "react";
import { KiteEventData } from "@/components/hostelworld/types";
import { TeacherKiteClass } from "@/rails/view/card/TeacherKiteClass";

interface TeacherKiteEventsClientProps {
  kiteEvents: KiteEventData[];
}

export function TeacherKiteEventsClient({ kiteEvents }: TeacherKiteEventsClientProps) {
  const [showPastEvents, setShowPastEvents] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to compare only dates

  const pastEvents: KiteEventData[] = [];
  const currentAndFutureEvents: KiteEventData[] = [];

  kiteEvents.forEach((event) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0); // Normalize event date

    if (eventDate < today) {
      pastEvents.push(event);
    } else {
      currentAndFutureEvents.push(event);
    }
  });

  const sortEvents = (a: KiteEventData, b: KiteEventData) => {
    const statusOrder: { [key: string]: number } = {
      teacherConfirmation: 1,
      completed: 2,
    };
    const statusA = statusOrder[a.status] || 99;
    const statusB = statusOrder[b.status] || 99;

    if (statusA !== statusB) {
      return statusA - statusB;
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  };

  const groupAndSortEvents = (events: KiteEventData[]) => {
    const eventsByDate = new Map<string, KiteEventData[]>();
    events.forEach((event) => {
      const eventDate = new Date(event.date).toDateString();
      if (!eventsByDate.has(eventDate)) {
        eventsByDate.set(eventDate, []);
      }
      eventsByDate.get(eventDate)?.push(event);
    });

    const sortedDates = Array.from(eventsByDate.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return sortedDates.map((date) => (
      <div key={date} className="mb-8">
        <h3 className="text-xl font-bold mb-4">{date}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventsByDate.get(date)?.sort(sortEvents).map((event) => (
            <TeacherKiteClass key={event.id} event={event} />
          ))}
        </div>
      </div>
    ));
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Upcoming Kite Events</h2>
      {currentAndFutureEvents.length > 0 ? (
        groupAndSortEvents(currentAndFutureEvents)
      ) : (
        <p>No upcoming kite events found for this teacher.</p>
      )}

      {pastEvents.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowPastEvents(!showPastEvents)}
            className="text-blue-600 hover:underline text-lg font-semibold mb-4"
          >
            {showPastEvents ? "Hide Past Events" : "Show Past Events"} ({pastEvents.length})
          </button>
          {showPastEvents && (
            <div className="mt-4">
              <h2 className="text-2xl font-semibold mb-4">Past Kite Events</h2>
              {groupAndSortEvents(pastEvents)}
            </div>
          )}
        </div>
      )}
    </>
  );
}
