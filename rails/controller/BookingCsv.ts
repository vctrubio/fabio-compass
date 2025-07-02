import db from "@/drizzle";
import { eq, asc, desc } from "drizzle-orm";
import { Booking } from "@/drizzle/migrations/schema";

export interface BookingCsvData {
  booking_id: string;
  student_name: string;
  package_description: string;
  package_duration: number;
  package_price: number;
  lesson_count: number;
  used_minutes: number;
  created_at: string;
  start_date: string;
  end_date: string;
}

const bookingCsvQuery = {
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
    package: {
      columns: {
        description: true,
        duration: true,
        price: true,
      },
    },
    lessons: {
      columns: {
        id: true,
        duration: true,
      },
      with: {
        kiteEvents: {
          columns: {
            id: true,
            duration: true,
          },
        },
      },
    },
  },
  orderBy: desc(Booking.created_at),
} as const;

function parseBookingForCsv(booking: any): BookingCsvData[] {
  const packageDescription = booking.package?.description || "No description";
  const packageDurationMinutes = booking.package?.duration || 0;
  // Convert minutes to hours (4 hours = 4, 4.5 hours = 4.5)
  const packageDuration = packageDurationMinutes / 60;
  const packagePrice = booking.package?.price || 0;
  const lessonCount = booking.lessons?.length || 0;
  
  // Calculate used minutes from lessons and kite events
  let usedMinutes = 0;
  booking.lessons?.forEach((lesson: any) => {
    if (lesson.kiteEvents?.length > 0) {
      // If lesson has kite events, sum their durations
      lesson.kiteEvents.forEach((event: any) => {
        usedMinutes += event.duration || 0;
      });
    } else {
      // If no kite events, use lesson duration
      usedMinutes += lesson.duration || 0;
    }
  });
  
  // Return one row per student in the booking
  return booking.bookingStudents?.map((bookingStudent: any) => ({
    booking_id: booking.id,
    student_name: bookingStudent.student?.name || "Unknown",
    package_description: packageDescription,
    package_duration: packageDuration,
    package_price: packagePrice,
    lesson_count: lessonCount,
    used_minutes: usedMinutes,
    created_at: booking.created_at,
    start_date: booking.start_date || booking.created_at,
    end_date: booking.end_date || booking.created_at,
  })) || [];
}

export async function getBookingCsvData(monthFilter?: string): Promise<BookingCsvData[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting booking CSV data");
    
    const bookings = await db.query.Booking.findMany(bookingCsvQuery);
    
    // Flatten the results since each booking can have multiple students
    const result: BookingCsvData[] = [];
    bookings.forEach(booking => {
      const csvRows = parseBookingForCsv(booking);
      result.push(...csvRows);
    });
    
    // Filter by month if provided
    const filteredResult = monthFilter 
      ? result.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          const bookingMonth = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
          return bookingMonth === monthFilter;
        })
      : result;
    
    if (process.env.DEBUG) console.log("(dev:drizzle:server) booking CSV data parsed");
    return filteredResult;
  } catch (error: any) {
    // Check for Supabase/database connection errors
    if (error?.cause?.code === 'XX000' || error?.message?.includes('Tenant or user not found')) {
      console.warn("⚠️ Supabase database error. Please check connection and try again.");
      return []; // Return empty array instead of throwing
    }
    
    console.error("Error fetching booking CSV data:", error);
    return []; // Return empty array instead of throwing
  }
}

export function calculateMonthStats(bookings: BookingCsvData[]) {
  const totalBookings = bookings.length;
  const totalDuration = bookings.reduce((sum, booking) => sum + booking.package_duration, 0);
  const totalPrice = bookings.reduce((sum, booking) => sum + booking.package_price, 0);
  
  return {
    totalBookings,
    totalDuration: Math.round(totalDuration * 10) / 10, // Round to 1 decimal
    totalPrice
  };
}