import React from "react";
import {
  getTeacherLessons,
  getTeacherById,
} from "@/rails/controller/TeacherCsv";
import { TeacherKiteClass } from "@/rails/view/card/TeacherKiteClass";
import { KiteEventData } from "@/components/hostelworld/types";

interface TeacherPageProps {
  params: {
    id: string;
  };
}

function transformKiteEvents(organizedLessons: any): KiteEventData[] {
  const allLessons = [...organizedLessons.past, ...organizedLessons.today, ...organizedLessons.upcoming];
  const kiteEvents: KiteEventData[] = [];

  allLessons.forEach(lesson => {
    lesson.kite_events.forEach((event: any) => {
      // Extract time from date string (assuming format includes time)
      const eventDate = new Date(event.date);
      const timeString = eventDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      kiteEvents.push({
        id: event.id,
        date: event.date,
        time: timeString,
        duration: event.duration,
        location: event.location,
        status: event.status,
        lesson_id: lesson.lesson_id,
        students: lesson.students.map((name: string, index: number) => ({
          id: `student-${index}`,
          name: name
        })),
        equipments: event.equipments || []
      });
    });
  });

  return kiteEvents;
}

function groupEventsByDate(events: KiteEventData[]): Record<string, KiteEventData[]> {
  const grouped: Record<string, KiteEventData[]> = {};

  events.forEach(event => {
    const dateKey = event.date.split('T')[0]; // Extract date part (YYYY-MM-DD)
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });

  return grouped;
}

function sortEventsByStatus(events: KiteEventData[]): KiteEventData[] {
  const statusPriority: Record<string, number> = {
    'teacherConfirmation': 1,
    'completed': 2,
    'planned': 3,
    'cancelled': 4
  };

  return events.sort((a, b) => {
    const priorityA = statusPriority[a.status] || 999;
    const priorityB = statusPriority[b.status] || 999;
    return priorityA - priorityB;
  });
}

function categorizeEventsByTime(groupedEvents: Record<string, KiteEventData[]>): {
  past: Record<string, KiteEventData[]>;
  today: Record<string, KiteEventData[]>;
  future: Record<string, KiteEventData[]>;
} {
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];
  
  const past: Record<string, KiteEventData[]> = {};
  const todayEvents: Record<string, KiteEventData[]> = {};
  const future: Record<string, KiteEventData[]> = {};

  Object.entries(groupedEvents).forEach(([dateKey, events]) => {
    const sortedEvents = sortEventsByStatus(events);
    
    if (dateKey < todayDateString) {
      past[dateKey] = sortedEvents;
    } else if (dateKey === todayDateString) {
      todayEvents[dateKey] = sortedEvents;
    } else {
      future[dateKey] = sortedEvents;
    }
  });

  return { past, today: todayEvents, future };
}

function calculateDateStats(events: KiteEventData[]): {
  studentCount: number;
  lessonCount: number;
  kiteHours: number;
} {
  const uniqueStudents = new Set<string>();
  const uniqueLessons = new Set<string>();
  let totalMinutes = 0;

  events.forEach(event => {
    // Count unique students
    event.students.forEach(student => uniqueStudents.add(student.id));
    
    // Count unique lessons
    if (event.lesson_id) {
      uniqueLessons.add(event.lesson_id);
    }
    
    // Sum duration
    totalMinutes += event.duration;
  });

  return {
    studentCount: uniqueStudents.size,
    lessonCount: uniqueLessons.size,
    kiteHours: Math.round((totalMinutes / 60) * 10) / 10 // Round to 1 decimal place
  };
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dateKey = dateString;
  const todayKey = today.toISOString().split('T')[0];
  const tomorrowKey = tomorrow.toISOString().split('T')[0];
  
  if (dateKey === todayKey) {
    return `Today - ${date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  } else if (dateKey === tomorrowKey) {
    return `Tomorrow - ${date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const { id: teacherId } = await params;

  const [teacher, organizedLessons] = await Promise.all([
    getTeacherById(teacherId),
    getTeacherLessons(teacherId),
  ]);

  if (!teacher) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Teacher Not Found</h1>
          <p className="text-gray-600 mt-2">
            The teacher with ID {teacherId} does not exist.
          </p>
        </div>
      </div>
    );
  }

  const kiteEvents = transformKiteEvents(organizedLessons);
  const groupedEvents = groupEventsByDate(kiteEvents);
  const categorizedEvents = categorizeEventsByTime(groupedEvents);

  return (
    <div className="container mx-auto p-6">
      <div className="my-6 mx-auto flex items-center">
        <h1 className="text-3xl font-bold mx-auto">Hola {teacher.name}</h1>
      </div>
      
      <div className="space-y-8">
        {/* Today's Events */}
        {Object.entries(categorizedEvents.today).map(([dateKey, events]) => {
          const stats = calculateDateStats(events);
          return (
            <div key={dateKey} className="space-y-4">
              <div className="border-b border-blue-200 pb-2">
                <h2 className="text-2xl font-semibold text-blue-600">
                  {formatDateHeader(dateKey)}
                </h2>
                <div className="flex gap-4 mt-2 text-sm text-blue-500">
                  <span>{stats.studentCount} students</span>
                  <span>{stats.lessonCount} lessons</span>
                  <span>{stats.kiteHours}h kite time</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <TeacherKiteClass
                    key={event.id}
                    event={event}
                    viewFooter={true}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Future Events */}
        {Object.entries(categorizedEvents.future)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dateKey, events]) => {
            const stats = calculateDateStats(events);
            return (
              <div key={dateKey} className="space-y-4">
                <div className="border-b border-green-200 pb-2">
                  <h2 className="text-2xl font-semibold text-green-600">
                    {formatDateHeader(dateKey)}
                  </h2>
                  <div className="flex gap-4 mt-2 text-sm text-green-500">
                    <span>{stats.studentCount} students</span>
                    <span>{stats.lessonCount} lessons</span>
                    <span>{stats.kiteHours}h kite time</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <TeacherKiteClass
                      key={event.id}
                      event={event}
                      viewFooter={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}

        {/* Past Events */}
        {Object.entries(categorizedEvents.past)
          .sort(([a], [b]) => b.localeCompare(a)) // Reverse order for past events
          .map(([dateKey, events]) => {
            const stats = calculateDateStats(events);
            return (
              <div key={dateKey} className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h2 className="text-2xl font-semibold text-gray-600">
                    {formatDateHeader(dateKey)}
                  </h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{stats.studentCount} students</span>
                    <span>{stats.lessonCount} lessons</span>
                    <span>{stats.kiteHours}h kite time</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <TeacherKiteClass
                      key={event.id}
                      event={event}
                      viewFooter={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
