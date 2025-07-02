import db from "@/drizzle";
import { eq, asc, desc, and, gte, lte, sql } from "drizzle-orm";
import { Teacher, Lesson, KiteEvent } from "@/drizzle/migrations/schema";

export interface TeacherStatsData {
  teacher_id: string;
  teacher_name: string;
  teacher_role: string;
  languages: string[];
  phone?: string;
  country?: string;
  lesson_count: number;
  kite_event_count: number;
  total_duration_minutes: number;
  money_earned: number; // 30% of package prices
  completed_events: number;
  pending_confirmations: number;
  created_at: string;
}

const teacherStatsQuery = {
  with: {
    lessons: {
      columns: {
        id: true,
        status: true,
        created_at: true,
      },
      with: {
        booking: {
          columns: {
            id: true,
            date_start: true,
            date_end: true,
          },
          with: {
            package: {
              columns: {
                price: true,
                duration: true,
              },
            },
          },
        },
        kiteEvents: {
          columns: {
            id: true,
            date: true,
            duration: true,
            status: true,
          },
        },
      },
    },
  },
  orderBy: desc(Teacher.created_at),
} as const;

function calculateTeacherStats(teacher: any, monthFilter?: string): TeacherStatsData {
  const lessons = teacher.lessons || [];
  
  // Filter lessons by month if provided
  const filteredLessons = monthFilter ? 
    lessons.filter((lesson: any) => {
      const lessonDate = new Date(lesson.created_at);
      const lessonMonth = `${lessonDate.getFullYear()}-${String(lessonDate.getMonth() + 1).padStart(2, '0')}`;
      return lessonMonth === monthFilter;
    }) : lessons;

  let totalKiteEvents = 0;
  let totalDurationMinutes = 0;
  let totalMoneyEarned = 0;
  let completedEvents = 0;
  let pendingConfirmations = 0;

  filteredLessons.forEach((lesson: any) => {
    const kiteEvents = lesson.kiteEvents || [];
    const packagePrice = lesson.booking?.package?.price || 0;
    
    // Count kite events
    totalKiteEvents += kiteEvents.length;
    
    // Calculate duration and money from kite events
    kiteEvents.forEach((event: any) => {
      totalDurationMinutes += event.duration || 0;
      
      // Calculate 30% commission only for completed events
      if (event.status === 'completed') {
        totalMoneyEarned += (packagePrice * 0.30); // 30% commission
        completedEvents++;
      }
      
      if (event.status === 'teacherConfirmation') {
        pendingConfirmations++;
      }
    });
  });

  return {
    teacher_id: teacher.id,
    teacher_name: teacher.name,
    teacher_role: teacher.teacher_role || 'freelance',
    languages: teacher.languages || [],
    phone: teacher.phone,
    country: teacher.country,
    lesson_count: filteredLessons.length,
    kite_event_count: totalKiteEvents,
    total_duration_minutes: totalDurationMinutes,
    money_earned: Math.round(totalMoneyEarned * 100) / 100, // Round to 2 decimals
    completed_events: completedEvents,
    pending_confirmations: pendingConfirmations,
    created_at: teacher.created_at,
  };
}

export async function getAllTeachersStats(monthFilter?: string): Promise<TeacherStatsData[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting teachers stats data");
    
    const teachers = await db.query.Teacher.findMany(teacherStatsQuery);
    
    const teachersStats = teachers.map(teacher => calculateTeacherStats(teacher, monthFilter));
    
    // Sort by money earned (highest first)
    teachersStats.sort((a, b) => b.money_earned - a.money_earned);
    
    if (process.env.DEBUG) console.log("(dev:drizzle:server) teachers stats data parsed");
    return teachersStats;
  } catch (error: any) {
    // Check for Supabase/database connection errors
    if (error?.cause?.code === 'XX000' || error?.message?.includes('Tenant or user not found')) {
      console.warn("⚠️ Supabase database error. Please check connection and try again.");
      return [];
    }
    
    console.error("Error fetching teachers stats data:", error);
    return [];
  }
}

export function calculateOverallStats(teachersStats: TeacherStatsData[]) {
  const totalTeachers = teachersStats.length;
  const totalLessons = teachersStats.reduce((sum, teacher) => sum + teacher.lesson_count, 0);
  const totalKiteEvents = teachersStats.reduce((sum, teacher) => sum + teacher.kite_event_count, 0);
  const totalMoneyEarned = teachersStats.reduce((sum, teacher) => sum + teacher.money_earned, 0);
  const totalDuration = teachersStats.reduce((sum, teacher) => sum + teacher.total_duration_minutes, 0);
  const totalPendingConfirmations = teachersStats.reduce((sum, teacher) => sum + teacher.pending_confirmations, 0);
  
  return {
    totalTeachers,
    totalLessons,
    totalKiteEvents,
    totalMoneyEarned: Math.round(totalMoneyEarned * 100) / 100,
    totalDurationHours: Math.round((totalDuration / 60) * 10) / 10,
    totalPendingConfirmations,
    averageLessonsPerTeacher: totalTeachers > 0 ? Math.round((totalLessons / totalTeachers) * 10) / 10 : 0,
    averageMoneyPerTeacher: totalTeachers > 0 ? Math.round((totalMoneyEarned / totalTeachers) * 100) / 100 : 0,
  };
}

export function getAvailableMonths(): string[] {
  const now = new Date();
  const months: string[] = [];
  
  // Get last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
  }
  
  return months;
}