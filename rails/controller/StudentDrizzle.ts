/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { Student } from "@/drizzle/migrations/schema";
import { StudentType } from "@/rails/model/StudentModel";
import { DrizzleData } from "@/rails/types";

/**
 * StudentDrizzle handles fetching student data with nested relations
 * 
 * Hierarchy structure:
 * - Student
 *   - BookingStudents
 *     - Booking (with nested students array added in parseStudent)
 *       - Package 
 *       - BookingStudents (for attaching students directly to booking)
 *       - Lessons
 *         - KiteEvents
 *         - Teacher
 *   - UserWallet
 *   - Transactions
 *     - Payments
 */

const studentsWithRelations = {
  with: {
    bookingStudents: {
      with: {
        student: true, // Include student data in the bookingStudents relation
        booking: {
          with: {
            package: true,
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
    },
    userWallet: {
      with: {
        usersInAuth: true,
      },
    },
    transactions: {
      with: {
        payments: true,
      },
    },
  },
} as const;

function parseStudent(student: any): DrizzleData<StudentType> {
  const { bookingStudents, userWallet, transactions, ...studentModel } =
    student;
    
  // Process bookings to include students directly
  const processedBookingStudents = bookingStudents?.map((bs: any) => {
    if (bs.booking) {
      // Add students array to each booking
      const students = bs.booking.bookingStudents?.map((bsInner: any) => bsInner.student) || [];
      return {
        ...bs,
        booking: {
          ...bs.booking,
          students: students,
        },
      };
    }
    return bs;
  });

  return {
    model: studentModel,
    relations: {
      bookingStudents: processedBookingStudents,
      userWallet,
      transactions,
    },
    lambdas: calculateLambdaValues(student),
  };
}

const studentWithSort = {
  ...studentsWithRelations,
  orderBy: desc(Student.created_at), // Sort by newest first
};

function calculateLambdaValues(student: any) {
  const teachers = new Map<string, string>();
  let totalBookingMinutes = 0;
  let totalKiteEventMinutes = 0;
  let lessonsCount = 0;
  let kiteEventsCount = 0;

  student.bookingStudents?.forEach((bookingStudent: any) => {
    if (bookingStudent.booking?.package?.duration) {
      totalBookingMinutes += bookingStudent.booking.package.duration;
    }

    // Count lessons and extract teacher IDs/names and kite event data
    if (bookingStudent.booking?.lessons) {
      lessonsCount += bookingStudent.booking.lessons.length;

      bookingStudent.booking.lessons.forEach((lesson: any) => {
        if (lesson.teacher_id) {
          // If we have a teacher object with a name, use it, otherwise just store the ID
          if (lesson.teacher && lesson.teacher.name) {
            teachers.set(lesson.teacher_id, lesson.teacher.name);
          } else {
            teachers.set(lesson.teacher_id, lesson.teacher_id);
          }
        }

        // Count kite events and add their duration (in minutes)
        if (lesson.kiteEvents) {
          kiteEventsCount += lesson.kiteEvents.length;
          
          lesson.kiteEvents.forEach((kiteEvent: any) => {
            if (kiteEvent.duration && !isNaN(Number(kiteEvent.duration))) {
              totalKiteEventMinutes += Number(kiteEvent.duration);
            }
          });
        }
      });
    }
  });

  return {
    teachers: Array.from(teachers.values()),
    bookingMinutes: totalBookingMinutes,
    kiteEventMinutes: totalKiteEventMinutes,
    kiteEventHours: Number((totalKiteEventMinutes / 60).toFixed(1)),
    lessonsCount,
    kiteEventsCount,
    bookingsCount: student.bookingStudents?.length || 0,
  };
}

export async function drizzleStudents(): Promise<DrizzleData<StudentType>[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Students");
    const students = await db.query.Student.findMany(studentWithSort);
    const result = students.map(parseStudent);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Students");
    return result;
  } catch (error) {
    console.error("Error fetching students with Drizzle:", error);
    throw new Error("Failed to fetch students");
  }
}

export async function drizzleStudentById(id: string): Promise<DrizzleData<StudentType> | null> {
  try {
    const student = await db.query.Student.findFirst({
      where: eq(Student.id, id),
      ...studentsWithRelations, // Use the base relations without orderBy for single record
    });

    if (!student) {
      return null;
    }

    return parseStudent(student);
  } catch (error) {
    console.error("Error fetching student by ID with Drizzle:", error);
    throw new Error("Failed to fetch student");
  }
}
