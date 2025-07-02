import db from "@/drizzle";
import { eq, asc, desc } from "drizzle-orm";
import { Lesson, Teacher } from "@/drizzle/migrations/schema";

export interface TeacherLessonData {
  lesson_id: string;
  teacher_id: string;
  teacher_name: string;
  booking_id: string;
  lesson_status: string;
  lesson_created_at: string;
  booking_start_date: string;
  booking_end_date: string;
  package_description: string;
  package_duration: number;
  package_price: number;
  students: string[];
  kite_events: {
    id: string;
    date: string;
    duration: number;
    location: string;
    status: string;
    equipments: Array<{ id: string; type: string; model: string; size: number }>;
  }[];
}

export interface OrganizedLessons {
  past: TeacherLessonData[];
  today: TeacherLessonData[];
  upcoming: TeacherLessonData[];
}

const teacherLessonQuery = {
  with: {
    teacher: {
      columns: {
        name: true,
      },
    },
    booking: {
      columns: {
        id: true,
        date_start: true,
        date_end: true,
      },
      with: {
        package: {
          columns: {
            description: true,
            duration: true,
            price: true,
          },
        },
        bookingStudents: {
          with: {
            student: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
    },
    kiteEvents: {
      columns: {
        id: true,
        date: true,
        duration: true,
        location: true,
        status: true,
      },
      with: {
        kiteEventEquipments: {
          with: {
            equipment: {
              columns: {
                id: true,
                type: true,
                model: true,
                size: true,
              },
            },
          },
        },
      },
    },
  },
  orderBy: asc(Lesson.created_at),
} as const;

function parseTeacherLessons(lessons: any[]): TeacherLessonData[] {
  return lessons.map((lesson) => {
    const booking = lesson.booking;
    const packageData = booking?.package;
    const students = booking?.bookingStudents?.map((bs: any) => bs.student?.name || "Unknown") || [];
    
    const kiteEvents = lesson.kiteEvents?.map((event: any) => ({
      id: event.id,
      date: event.date,
      duration: event.duration || 0,
      location: event.location || "",
      status: event.status || "planned",
      equipments: event.kiteEventEquipments?.map((eq: any) => ({
        id: eq.equipment?.id || "",
        type: eq.equipment?.type || "",
        model: eq.equipment?.model || "",
        size: eq.equipment?.size || 0,
      })) || [],
    })) || [];

    return {
      lesson_id: lesson.id,
      teacher_id: lesson.teacher_id,
      teacher_name: lesson.teacher?.name || "Unknown",
      booking_id: booking?.id || "",
      lesson_status: lesson.status,
      lesson_created_at: lesson.created_at,
      booking_start_date: booking?.date_start || "",
      booking_end_date: booking?.date_end || "",
      package_description: packageData?.description || "No description",
      package_duration: packageData?.duration || 0,
      package_price: packageData?.price || 0,
      students,
      kite_events: kiteEvents,
    };
  });
}

function organizeLessonsByTime(lessons: TeacherLessonData[]): OrganizedLessons {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  const past: TeacherLessonData[] = [];
  const todayLessons: TeacherLessonData[] = [];
  const upcoming: TeacherLessonData[] = [];

  lessons.forEach((lesson) => {
    // Check if lesson has kite events with dates
    const hasKiteEvents = lesson.kite_events.length > 0;
    
    if (hasKiteEvents) {
      // Show lessons that have completed or teacherConfirmation events
      const hasRelevantEvents = lesson.kite_events.some(event => 
        event.status === 'completed' || event.status === 'teacherConfirmation'
      );
      
      if (!hasRelevantEvents) {
        return; // Skip lessons without relevant events
      }
      
      // Get the earliest event date to determine lesson timing
      const earliestEvent = lesson.kite_events.reduce((earliest, current) => 
        new Date(current.date) < new Date(earliest.date) ? current : earliest
      );
      
      const eventDate = new Date(earliestEvent.date);
      
      if (eventDate < todayStart) {
        past.push(lesson);
      } else if (eventDate >= todayStart && eventDate <= todayEnd) {
        todayLessons.push(lesson);
      } else {
        upcoming.push(lesson);
      }
    } else {
      // For lessons without kite events, use booking dates
      const bookingStart = new Date(lesson.booking_start_date);
      
      if (bookingStart < todayStart) {
        past.push(lesson);
      } else if (bookingStart >= todayStart && bookingStart <= todayEnd) {
        todayLessons.push(lesson);
      } else {
        upcoming.push(lesson);
      }
    }
  });

  return {
    past: past.sort((a, b) => new Date(b.lesson_created_at).getTime() - new Date(a.lesson_created_at).getTime()), // Most recent first
    today: todayLessons.sort((a, b) => new Date(a.lesson_created_at).getTime() - new Date(b.lesson_created_at).getTime()),
    upcoming: upcoming.sort((a, b) => new Date(a.lesson_created_at).getTime() - new Date(b.lesson_created_at).getTime()),
  };
}

export async function getTeacherLessons(teacherId: string): Promise<OrganizedLessons> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting teacher lessons data");
    
    const lessons = await db.query.Lesson.findMany({
      where: eq(Lesson.teacher_id, teacherId),
      ...teacherLessonQuery,
    });
    
    const parsedLessons = parseTeacherLessons(lessons);
    const organizedLessons = organizeLessonsByTime(parsedLessons);
    
    if (process.env.DEBUG) console.log("(dev:drizzle:server) teacher lessons data parsed");
    return organizedLessons;
  } catch (error: any) {
    // Check for Supabase/database connection errors
    if (error?.cause?.code === 'XX000' || error?.message?.includes('Tenant or user not found')) {
      console.warn("⚠️ Supabase database error. Please check connection and try again.");
      return { past: [], today: [], upcoming: [] };
    }
    
    console.error("Error fetching teacher lessons data:", error);
    return { past: [], today: [], upcoming: [] };
  }
}

export async function getTeacherById(teacherId: string) {
  try {
    const teacher = await db.query.Teacher.findFirst({
      where: eq(Teacher.id, teacherId),
    });
    return teacher;
  } catch (error: any) {
    console.error("Error fetching teacher:", error);
    return null;
  }
}

export function calculateTeacherStats(organizedLessons: OrganizedLessons) {
  const allLessons = [...organizedLessons.past, ...organizedLessons.today, ...organizedLessons.upcoming];
  
  const totalLessons = allLessons.length;
  const totalKiteEvents = allLessons.reduce((sum, lesson) => sum + lesson.kite_events.length, 0);
  const totalDuration = allLessons.reduce((sum, lesson) => 
    sum + lesson.kite_events.reduce((eventSum, event) => eventSum + event.duration, 0), 0
  );
  const pendingConfirmations = allLessons.reduce((sum, lesson) => 
    sum + lesson.kite_events.filter(event => event.status === 'teacherConfirmation').length, 0
  );
  
  return {
    totalLessons,
    totalKiteEvents,
    totalDuration,
    pendingConfirmations,
  };
}