"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { BookingWithRelations } from "@/rails/types";
import AdminHeader from "./AdminHeader";
import AdminStats from "./AdminStats";
import AdminBookings from "./AdminBookings";
import AdminEvents from "./AdminEvents";
import AdminStartingTime from "./AdminStartingTime";
import AdminSlotBoard from "./AdminSlotBoard";
import AdminTeacherLessonStudentMap from "./AdminTeacherLessonStudentMap";
import { AdminDebugPanel } from "@/components/admin/AdminDebugPanel";
import { AdminShareEvents } from "@/components/admin/AdminShareEvents";
import { AdminEventBoard } from "./AdminEventBoard";

interface AdminDashboardProps {
  allBookings: BookingWithRelations[];
}

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
  booking: BookingWithRelations;
  students: Array<{
    id: string;
    name: string;
  }>;
}

export default function AdminDashboard({ allBookings }: AdminDashboardProps) {
  const searchParams = useSearchParams();
  const selectedDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  // Extract kite events from bookings relations
  const allKiteEvents = useMemo(() => {
    const events: any[] = [];

    allBookings.forEach((booking) => {
      booking.relations.lessons?.forEach((lesson) => {
        // Ensure we have the necessary teacher info before proceeding
        if (!lesson.teacher_id || !lesson.teacher?.name) {
          return;
        }

        lesson.kiteEvents?.forEach((kiteEvent) => {
          events.push({
            id: kiteEvent.id,
            date: kiteEvent.date,
            duration: kiteEvent.duration,
            location: kiteEvent.location,
            status: kiteEvent.status,
            lesson_id: kiteEvent.lesson_id,
            teacher: {
              id: lesson.teacher_id,
              name: lesson.teacher.name,
            },
            booking: booking, // Pass the whole booking for stats calculation
            students: booking.lambdas.students || [],
          });
        });
      });
    });

    // Sort by date
    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [allBookings]);

  // Filter bookings based on selected date
  const filteredBookings = useMemo(() => {
    if (!selectedDate) return allBookings;

    return allBookings.filter((booking) => {
      const bookingStart = new Date(booking.model.date_start);
      const bookingEnd = new Date(booking.model.date_end);
      const filterDate = new Date(selectedDate);

      // Set time to start and end of day for comparison
      const filterDateStart = new Date(filterDate);
      filterDateStart.setHours(0, 0, 0, 0);

      const filterDateEnd = new Date(filterDate);
      filterDateEnd.setHours(23, 59, 59, 999);

      // Check if booking overlaps with selected date
      return bookingStart <= filterDateEnd && bookingEnd >= filterDateStart;
    });
  }, [allBookings, selectedDate]);

  // Filter kite events based on selected date
  const filteredKiteEvents = useMemo(() => {
    if (!selectedDate) return allKiteEvents;

    return allKiteEvents.filter((kiteEvent) => {
      const eventDate = new Date(kiteEvent.date);
      const filterDate = new Date(selectedDate);

      // Set time to start and end of day for comparison
      const filterDateStart = new Date(filterDate);
      filterDateStart.setHours(0, 0, 0, 0);

      const filterDateEnd = new Date(filterDate);
      filterDateEnd.setHours(23, 59, 59, 999);

      // Check if event date is within selected day
      return eventDate >= filterDateStart && eventDate <= filterDateEnd;
    });
  }, [allKiteEvents, selectedDate]);

  const startingTime = useMemo(() => {
    if (filteredKiteEvents.length === 0) {
      return '13:00'; // Default to 13:00 if no events
    }

    const earliestEvent = filteredKiteEvents.reduce((earliest, current) => {
      const earliestDate = new Date(earliest.date);
      const currentDate = new Date(current.date);
      return earliestDate < currentDate ? earliest : current;
    });

    return new Date(earliestEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  }, [filteredKiteEvents]);

  interface EventPlanning {
    singleDuration: number;
    groupDuration: number;
    location: 'Los Lances' | 'Valdevaqueros';
    submitTime: string;
    gapDuration: number;
  }

  const [eventPlanning, setEventPlanning] = useState<EventPlanning>(() => ({
    singleDuration: 120,
    groupDuration: 180,
    location: 'Los Lances',
    submitTime: startingTime, // Initialize with startingTime
    gapDuration: 0,
  }));

  const [selectedLessonsId, setSelectedLessonsId] = useState<string[]>([]);

  const handleLessonClick = useCallback((lessonId: string) => {
    setSelectedLessonsId((prevSelectedLessonsId) => {
      if (prevSelectedLessonsId.includes(lessonId)) {
        return prevSelectedLessonsId.filter((id) => id !== lessonId);
      } else {
        return [...prevSelectedLessonsId, lessonId];
      }
    });
  }, []);
  return (
    <main className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <AdminHeader selectedDate={selectedDate} />
        <AdminStats filteredKiteEvents={filteredKiteEvents} />
        <AdminBookings
          bookings={filteredBookings}
          selectedDate={selectedDate}
          filteredKiteEvents={filteredKiteEvents}
        />
        <AdminEventBoard 
          startingTime={startingTime} 
          eventPlanning={eventPlanning}
          setEventPlanning={setEventPlanning}
          selectedLessons={selectedLessonsId}
        />
        <SelectedLessonsDisplay
          selectedLessonsId={selectedLessonsId}
          allBookings={allBookings}
          eventPlanning={eventPlanning}
        />
        <div className="mt-6">
          <AdminTeacherLessonStudentMap
            allBookings={filteredBookings}
            onLessonClick={handleLessonClick}
          />
          <AdminSlotBoard filteredKiteEvents={filteredKiteEvents} />
        </div>

        <AdminDebugPanel filteredBookings={filteredBookings} />
        <AdminShareEvents filteredKiteEvents={filteredKiteEvents} />
        <AdminStartingTime filteredKiteEvents={filteredKiteEvents} />
      </div>
    </main>
  );
}

interface SelectedLessonsDisplayProps {
  selectedLessonsId: string[];
  allBookings: BookingWithRelations[];
  eventPlanning: {
    singleDuration: number;
    groupDuration: number;
    location: 'Los Lances' | 'Valdevaqueros';
    submitTime: string;
    gapDuration: number;
  };
}

const SelectedLessonsDisplay: React.FC<SelectedLessonsDisplayProps> = ({
  selectedLessonsId,
  allBookings,
  eventPlanning,
}) => {
  const lessonsByTeacher = useMemo(() => {
    const groupedLessons = new Map<string, any[]>();

    selectedLessonsId.forEach((lessonId) => {
      allBookings.forEach((booking) => {
        booking.relations.lessons?.forEach((lesson) => {
          if (lesson.id === lessonId) {
            // Skip lessons that have kite events
            if (lesson.kiteEvents && lesson.kiteEvents.length > 0) {
              return;
            }
            const teacherName = lesson.teacher?.name || 'N/A';
            const isGroupLesson = (booking.lambdas.students?.length || 0) > 1; // Assuming group if more than 1 student
            const duration = isGroupLesson ? eventPlanning.groupDuration : eventPlanning.singleDuration;

            // Calculate potential start time
            const [submitHours, submitMinutes] = eventPlanning.submitTime.split(':').map(Number);
            const startTime = new Date();
            startTime.setHours(submitHours, submitMinutes, 0, 0);

            // You can add more sophisticated time calculation here if needed
            // For now, it's just the submitTime from eventPlanning
            const calculatedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

            if (!groupedLessons.has(teacherName)) {
              groupedLessons.set(teacherName, []);
            }
            groupedLessons.get(teacherName)?.push({
              id: lesson.id,
              packageId: booking.relations.package?.id || 'N/A',
              students: booking.lambdas.students?.map(s => s.name).join(', ') || 'No students',
              capacity: booking.relations.package?.capacity || 'N/A',
              lessonType: isGroupLesson ? 'Group' : 'Single',
              location: eventPlanning.location,
              calculatedStartTime: calculatedStartTime,
            });
          }
        });
      });
    });
    return Array.from(groupedLessons.entries());
  }, [selectedLessonsId, allBookings, eventPlanning]);

  if (selectedLessonsId.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4">Selected Lessons</h3>
      {lessonsByTeacher.map(([teacherName, lessons]) => (
        <div key={teacherName} className="mb-6 last:mb-0">
          <h4 className="text-md font-semibold mb-3 p-2 bg-gray-200 dark:bg-gray-700 rounded-md">Teacher: {teacherName}</h4>
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p className="text-sm font-medium">Lesson ID: {lesson.id}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Package ID: {lesson.packageId}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Students: {lesson.students}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Capacity: {lesson.capacity}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Lesson Type: {lesson.lessonType}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Location: {lesson.location}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Calculated Start Time: {lesson.calculatedStartTime}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
