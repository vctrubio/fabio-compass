import db from "@/drizzle";
import { eq, asc, desc } from "drizzle-orm";
import { KiteEvent } from "@/drizzle/migrations/schema";

export interface KiteEventCsvData {
  event_id: string;
  date: string;
  duration: number;
  location: string;
  status: string;
  teacher_name: string;
  students: string; // Comma-separated student names
  created_at: string;
}

const kiteEventCsvQuery = {
  with: {
    lesson: {
      with: {
        teacher: {
          columns: {
            name: true,
          },
        },
        booking: {
          with: {
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
      },
    },
  },
  orderBy: desc(KiteEvent.date),
} as const;

function parseKiteEventForCsv(kiteEvent: any): KiteEventCsvData {
  const teacherName = kiteEvent.lesson?.teacher?.name || "No teacher assigned";
  
  // Get all students from the booking
  const students = kiteEvent.lesson?.booking?.bookingStudents?.map((bs: any) => bs.student?.name).filter(Boolean) || [];
  const studentsString = students.join(", ");
  
  return {
    event_id: kiteEvent.id,
    date: kiteEvent.date,
    duration: kiteEvent.duration,
    location: kiteEvent.location,
    status: kiteEvent.status,
    teacher_name: teacherName,
    students: studentsString || "No students",
    created_at: kiteEvent.created_at,
  };
}

export async function getKiteEventCsvData(monthFilter?: string): Promise<KiteEventCsvData[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting kite event CSV data");
    
    const kiteEvents = await db.query.KiteEvent.findMany(kiteEventCsvQuery);
    
    // Parse the results
    const result: KiteEventCsvData[] = kiteEvents.map(parseKiteEventForCsv);
    
    // Filter by month if provided
    const filteredResult = monthFilter 
      ? result.filter(event => {
          const eventDate = new Date(event.date);
          const eventMonth = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
          return eventMonth === monthFilter;
        })
      : result;
    
    if (process.env.DEBUG) console.log("(dev:drizzle:server) kite event CSV data parsed");
    return filteredResult;
  } catch (error: any) {
    // Check for Supabase/database connection errors
    if (error?.cause?.code === 'XX000' || error?.message?.includes('Tenant or user not found')) {
      console.warn("⚠️ Supabase database error. Please check connection and try again.");
      return []; // Return empty array instead of throwing
    }
    
    console.error("Error fetching kite event CSV data:", error);
    return []; // Return empty array instead of throwing
  }
}

export function calculateEventStats(events: KiteEventCsvData[]) {
  const totalEvents = events.length;
  const totalDuration = events.reduce((sum, event) => sum + event.duration, 0);
  const totalHours = Math.round((totalDuration / 60) * 10) / 10; // Convert minutes to hours
  
  // Count unique students across all events
  const allStudents = new Set<string>();
  events.forEach(event => {
    if (event.students !== "No students") {
      event.students.split(", ").forEach(student => allStudents.add(student.trim()));
    }
  });
  
  return {
    totalEvents,
    totalHours,
    uniqueStudents: allStudents.size
  };
}