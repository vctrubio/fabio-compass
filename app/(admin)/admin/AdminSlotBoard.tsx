"use client";

import { useMemo } from "react";
import { KiteEventData } from "@/components/hostelworld/types";
import { getTime } from "@/components/getters";
import { EventCard } from "@/rails/view/card/EventCard";
import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";

interface AdminSlotBoardProps {
  filteredKiteEvents: any[];
}

interface TeacherWithEvents {
  teacher: { id: string; name: string };
  events: KiteEventData[];
}

// --- Helper Functions ---
const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(":")) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const roundDown = (num: number, multiple: number) =>
  Math.floor(num / multiple) * multiple;
const roundUp = (num: number, multiple: number) =>
  Math.ceil(num / multiple) * multiple;

// --- Components ---

export default function AdminSlotBoard({
  filteredKiteEvents,
}: AdminSlotBoardProps) {
  const eventsByTeacher = useMemo(() => {
    // 1. Clean and transform the raw event data (already done in AdminDashboard, but ensure type safety)
    const kiteEventData = filteredKiteEvents
      .map((event) => {
        // Ensure teacher data is present and correctly structured
        if (!event.teacher?.id || !event.teacher?.name) {
          console.warn(
            "Kite event is missing complete teacher information, skipping:",
            event,
          );
          return null;
        }
        return {
          id: event.id,
          lesson_id: event.lesson_id,
          date: event.date,
          time: getTime(new Date(event.date)), // Ensure time is formatted consistently
          duration: event.duration,
          location: event.location,
          status: event.status,
          teacher: {
            id: event.teacher.id,
            name: event.teacher.name,
          },
          students: event.students || [],
          // pricePerHour: 50, // This is now handled by AdminDashboard for stats
        };
      })
      .filter(Boolean) as KiteEventData[];

    // 2. Group events by teacher
    const grouped = new Map<string, TeacherWithEvents>();
    kiteEventData.forEach((event) => {
      const teacherId = event.teacher.id;
      if (!grouped.has(teacherId)) {
        grouped.set(teacherId, {
          teacher: { id: teacherId, name: event.teacher.name },
          events: [],
        });
      }
      grouped.get(teacherId)!.events.push(event);
    });

    // 3. Sort events for each teacher and return as an array
    const result = Array.from(grouped.values());
    result.forEach((teacherGroup) => {
      teacherGroup.events.sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
      );
    });

    return result;
  }, [filteredKiteEvents]);

  if (eventsByTeacher.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 mt-6">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No events scheduled for this date.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Teacher Schedule</h2>
      <div className="space-y-6">
        {eventsByTeacher.map(({ teacher, events }) => (
          <div key={teacher.id}>
            <div className="flex items-center gap-2 mb-2">
              <HeadsetIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-medium">{teacher.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} viewMode="grid" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
