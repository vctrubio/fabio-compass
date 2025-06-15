/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { PackageStudent } from "@/drizzle/migrations/schema";
import { PackageStudentType } from "@/rails/model/PackageStudentModel";
import { DrizzleData } from "@/rails/types";

/**
 * PackageDrizzle handles fetching package data with nested relations
 * 
 * Hierarchy structure:
 * - Package
 *   - Bookings
 *     - BookingStudents
 *       - Students
 *     - Lessons
 *       - KiteEvents
 *       - Teacher
 */

const packagesWithRelations = {
  with: {
    bookings: {
      with: {
        bookingStudents: {
          with: {
            student: true,
          },
        },
        lessons: {
          with: {
            kiteEvents: true,
            teacher: true,
          },
        },
      },
    },
  },
} as const;

function parsePackage(packageData: any): DrizzleData<PackageStudentType> {
  const { bookings, ...packageModel } = packageData;

  return {
    model: packageModel,
    relations: {
      bookings,
    },
    lambdas: calculateLambdaValues(packageData),
  };
}

const packageWithSort = {
  ...packagesWithRelations,
  orderBy: desc(PackageStudent.created_at), // Sort by newest first
};

function calculateLambdaValues(packageData: any) {
  let totalBookings = 0;
  let totalStudents = 0;
  let totalLessons = 0;
  let totalKiteEvents = 0;
  const uniqueStudents = new Set<string>();
  const uniqueTeachers = new Set<string>();

  packageData.bookings?.forEach((booking: any) => {
    totalBookings++;

    // Count unique students
    booking.bookingStudents?.forEach((bs: any) => {
      if (bs.student_id) {
        uniqueStudents.add(bs.student_id);
      }
    });

    // Count lessons and kite events
    booking.lessons?.forEach((lesson: any) => {
      totalLessons++;
      
      if (lesson.teacher_id) {
        uniqueTeachers.add(lesson.teacher_id);
      }

      if (lesson.kiteEvents) {
        totalKiteEvents += lesson.kiteEvents.length;
      }
    });
  });

  totalStudents = uniqueStudents.size;

  return {
    bookingsCount: totalBookings,
    studentsCount: totalStudents,
    lessonsCount: totalLessons,
    kiteEventsCount: totalKiteEvents,
    teachersCount: uniqueTeachers.size,
  };
}

export async function drizzlePackages(): Promise<DrizzleData<PackageStudentType>[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Packages");
    const packages = await db.query.PackageStudent.findMany(packageWithSort);
    const result = packages.map(parsePackage);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Packages");
    return result;
  } catch (error) {
    console.error("Error fetching packages with Drizzle:", error);
    throw new Error("Failed to fetch packages");
  }
}

export async function drizzlePackageById(id: string): Promise<DrizzleData<PackageStudentType> | null> {
  try {
    const packageData = await db.query.PackageStudent.findFirst({
      where: eq(PackageStudent.id, id),
      ...packagesWithRelations, // Use the base relations without orderBy for single record
    });

    if (!packageData) {
      return null;
    }

    return parsePackage(packageData);
  } catch (error) {
    console.error("Error fetching package by ID with Drizzle:", error);
    throw new Error("Failed to fetch package");
  }
}
