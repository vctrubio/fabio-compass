import db from "@/drizzle";
import { eq, asc, desc } from "drizzle-orm";
import { Booking } from "@/drizzle/migrations/schema";
import { BookingType } from "@/rails/model/BookingModel";
import { DrizzleData, BookingWithRelations } from "@/rails/types";

const bookingsWithRelations = {
  with: {
    bookingStudents: {
      with: {
        student: true,
      },
    },
    lessons: {
      with: {
        teacher: {
          columns: {
            name: true,
          },
        },
        kiteEvents: true,
      },
    },
    package: true,
  },
} as const;

function parseBooking(booking: any): DrizzleData<BookingType> {
  const {
    bookingStudents,
    lessons,
    package: packageData,
    ...bookingModel
  } = booking;

  return {
    model: bookingModel,
    relations: {
      bookingStudents,
      lessons,
      package: packageData,
    },
    lambdas: calculateLambdaValues(booking),
  };
}

const bookingWithSort = {
  ...bookingsWithRelations,
  orderBy: desc(Booking.created_at), 
};

const bookingWithDateSort = {
  ...bookingsWithRelations,
  orderBy: asc(Booking.date_start), 
};

function calculateLambdaValues(booking: any) {
  const studentsArray =
    booking.bookingStudents?.map((bookingStudent: any) => ({
      id: bookingStudent.student?.id,
      name: bookingStudent.student?.name,
    })) || [];

  const totalLessons = booking.lessons?.length || 0;

  let totalKiteEvents = 0;
  booking.lessons?.forEach((lesson: any) => {
    totalKiteEvents += lesson.kiteEvents?.length || 0;
  });

  return {
    students: studentsArray, // Array of clean student objects with id, name, languages only
    totalLessons, // Total number of lessons
    totalKiteEvents, // Total number of kite events
  };
}

export async function drizzleBookings(): Promise<BookingWithRelations[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Bookings");
    
    // Use the capitalized table name as defined in schema
    const bookings = await db.query.Booking.findMany(bookingWithSort);
    
    if (process.env.DEBUG) console.log("222222");
    const result = bookings.map(parseBooking);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Bookings");
    return result;
  } catch (error: any) {
    // Check for Supabase/database connection errors
    if (error?.cause?.code === 'XX000' || error?.message?.includes('Tenant or user not found')) {
      console.warn("⚠️ Supabase database error. Please check connection and try again.");
      return []; // Return empty array instead of throwing
    }
    
    console.error("Error fetching bookings with Drizzle:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function drizzleBookingsSortedByDate(): Promise<BookingWithRelations[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Bookings sorted by date");
    
    // Use the capitalized table name as defined in schema
    const bookings = await db.query.Booking.findMany(bookingWithDateSort);
    
    if (process.env.DEBUG) console.log("222222");
    const result = bookings.map(parseBooking);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Bookings sorted by date");
    return result;
  } catch (error: any) {
    // Check for Supabase/database connection errors
    if (error?.cause?.code === 'XX000' || error?.message?.includes('Tenant or user not found')) {
      console.warn("⚠️ Supabase database error. Please check connection and try again.");
      return []; // Return empty array instead of throwing
    }
    
    console.error("Error fetching bookings with Drizzle:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function drizzleBookingById(
  id: string
): Promise<BookingWithRelations | null> {
  try {
    const booking = await db.query.Booking.findFirst({
      where: eq(Booking.id, id),
      ...bookingsWithRelations, // Use the base relations without orderBy for single record
    });

    if (!booking) {
      return null;
    }

    return parseBooking(booking);
  } catch (error: any) {
    // Check for Supabase/database connection errors
    if (error?.cause?.code === 'XX000' || error?.message?.includes('Tenant or user not found')) {
      console.warn("⚠️ Supabase database error. Please check connection and try again.");
      return null; // Return null instead of throwing
    }
    
    console.error("Error fetching booking by ID with Drizzle:", error);
    return null; // Return null instead of throwing
  }
}
