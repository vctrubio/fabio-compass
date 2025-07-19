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
      const timeString = eventDate.toLocaleTimeString('es-ES', { 
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

function groupLessonsByDate(organizedLessons: any): Record<string, any[]> {
  const allLessons = [...organizedLessons.past, ...organizedLessons.today, ...organizedLessons.upcoming];
  const grouped: Record<string, any[]> = {};
  allLessons.forEach(lesson => {
    // Each lesson may have multiple kite_events, but we use the date of each event
    lesson.kite_events.forEach((event: any) => {
      const dateKey = event.date.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      // Only add the lesson if it hasn't been added for this date yet
      if (!grouped[dateKey].includes(lesson)) {
        grouped[dateKey].push(lesson);
      }
    });
  });
  return grouped;
}

function calculateDateStats(events: KiteEventData[], lessonsForDate: any[]): {
  studentCount: number;
  lessonCount: number;
  kiteHours: number;
} {
  // Unique students from lessons for this date
  const uniqueStudents = new Set<string>();
  lessonsForDate.forEach(lesson => {
    (lesson.students || []).forEach((student: string) => uniqueStudents.add(student));
  });

  // Unique lessons from events (for kiteHours and lessonCount)
  const uniqueLessons = new Set<string>();
  let totalMinutes = 0;
  events.forEach(event => {
    if (event.lesson_id) {
      uniqueLessons.add(event.lesson_id);
    }
    totalMinutes += event.duration;
  });

  return {
    studentCount: uniqueStudents.size,
    lessonCount: uniqueLessons.size,
    kiteHours: Math.round((totalMinutes / 60) * 10) / 10
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
    return `Hoy - ${date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  } else if (dateKey === tomorrowKey) {
    return `Mañana - ${date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  } else {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}

// --- Add a reusable subcomponent for event sections ---
type EventSectionProps = {
  dateKey: string;
  events: KiteEventData[];
  lessonsForDate: any[];
  color: 'blue' | 'green' | 'gray' | 'orange';
  header: string;
};

function EventSection({ dateKey, events, lessonsForDate, color, header }: EventSectionProps) {
  const stats = calculateDateStats(events, lessonsForDate);
  const colorMap = {
    blue: {
      border: 'border-blue-200',
      text: 'text-blue-600',
      stats: 'text-blue-500',
    },
    green: {
      border: 'border-green-200',
      text: 'text-green-600',
      stats: 'text-green-500',
    },
    gray: {
      border: 'border-gray-200',
      text: 'text-gray-600',
      stats: 'text-gray-500',
    },
    orange: {
      border: 'border-orange-200',
      text: 'text-orange-600',
      stats: 'text-orange-500',
    },
  };
  const c = colorMap[color];
  return (
    <div key={dateKey} className="space-y-4">
      <div className={`border-b ${c.border} pb-2`}>
        <h2 className={`text-2xl font-semibold ${c.text}`}>{header}</h2>
        <div className={`flex gap-4 mt-2 text-sm ${c.stats}`}>
          <span>{stats.studentCount} students</span>
          <span>{stats.lessonCount} lessons</span>
          <span>{stats.kiteHours}h kite time</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <TeacherKiteClass key={event.id} event={event} viewFooter={true} />
        ))}
      </div>
    </div>
  );
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
  const groupedLessons = groupLessonsByDate(organizedLessons);

  return (
    <div className="container mx-auto p-6">
      <div className="my-6 mx-auto flex items-center">
        <h1 className="text-3xl font-bold mx-auto">Hola {teacher.name}</h1>
      </div>
      <div className="space-y-8">
        {/* Today's Events */}
        {Object.entries(categorizedEvents.today).map(([dateKey, events]) => (
          <EventSection
            key={dateKey}
            dateKey={dateKey}
            events={events}
            lessonsForDate={groupedLessons[dateKey] || []}
            color="blue"
            header={formatDateHeader(dateKey)}
          />
        ))}
        {/* Future Events (tomorrow = orange, others = green) */}
        {Object.entries(categorizedEvents.future)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dateKey, events]) => {
            // Detect tomorrow
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const tomorrowKey = tomorrow.toISOString().split('T')[0];
            const isTomorrow = dateKey === tomorrowKey;
            return (
              <EventSection
                key={dateKey}
                dateKey={dateKey}
                events={events}
                lessonsForDate={groupedLessons[dateKey] || []}
                color={isTomorrow ? 'orange' : 'green'}
                header={formatDateHeader(dateKey)}
              />
            );
          })}
        {/* Past Events */}
        {Object.entries(categorizedEvents.past)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([dateKey, events]) => (
            <EventSection
              key={dateKey}
              dateKey={dateKey}
              events={events}
              lessonsForDate={groupedLessons[dateKey] || []}
              color="gray"
              header={formatDateHeader(dateKey)}
            />
          ))}
      </div>
    </div>
  );
}
