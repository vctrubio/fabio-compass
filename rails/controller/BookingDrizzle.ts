import db from "@/drizzle";
import { eq, asc, desc } from "drizzle-orm";
import { Booking } from "@/drizzle/migrations/schema";
import { BookingType } from "@/rails/model/BookingModel";
import { DrizzleData } from "@/rails/types";

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

export async function drizzleBookings(): Promise<DrizzleData<BookingType>[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Bookings");
    const bookings = await db.query.Booking.findMany(bookingWithSort);
    if (process.env.DEBUG) console.log("222222");
    const result = bookings.map(parseBooking);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Bookings");
    return result;
  } catch (error) {
    console.error("Error fetching bookings with Drizzle:", error);
    throw new Error("Failed to fetch bookings");
  }
}

export async function drizzleBookingById(
  id: string
): Promise<DrizzleData<BookingType> | null> {
  try {
    const booking = await db.query.Booking.findFirst({
      where: eq(Booking.id, id),
      ...bookingsWithRelations, // Use the base relations without orderBy for single record
    });

    if (!booking) {
      return null;
    }

    return parseBooking(booking);
  } catch (error) {
    console.error("Error fetching booking by ID with Drizzle:", error);
    throw new Error("Failed to fetch booking");
  }
}
