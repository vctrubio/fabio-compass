import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { Lesson } from "@/drizzle/migrations/schema";
import { LessonType } from "@/rails/model/LessonModel";
import { DrizzleData } from "@/rails/types";

const lessonsWithRelations = {
  with: {
    teacher: {
      columns: {
        name: true,
      },
    },
    booking: {
      with: {
        package: true,
        bookingStudents: {
          with: {
            student: true,
          },
        },
      },
    },
    kiteEvents: true,
  },
} as const;

async function parseLesson(lesson: any): Promise<DrizzleData<LessonType>> {
  const { booking, kiteEvents, teacher, ...lessonModel } = lesson;

  return {
    model: lessonModel,
    relations: {
      teacher,
      booking,
      kiteEvents,
    },
    lambdas: await calculateLambdaValues(lesson),
  };
}

const lessonWithSort = {
  ...lessonsWithRelations,
  orderBy: desc(Lesson.created_at), // Sort by newest first
};

async function calculateLambdaValues(lesson: any) {
  let totalHours = 0;

  // Calculate total hours from kite event durations
  lesson.kiteEvents?.forEach((kiteEvent: any) => {
    if (kiteEvent.duration && !isNaN(Number(kiteEvent.duration))) {
      totalHours += Number(kiteEvent.duration);
    }
  });

  const bookingId = lesson.booking_id;
  const totalKiteEvents = lesson.kiteEvents?.length || 0;
  
  // Extract students from booking -> bookingStudents
  const students = lesson.booking?.bookingStudents?.map((bs: any) => bs.student) || [];
  const studentNames = students.map((student: any) => student?.name).filter(Boolean);

  // Find other lessons with the same booking ID
  let relatedLessons: Array<{ lessonId: string; teacherName: string }> = [];

  try {
    const otherLessons = await db.query.Lesson.findMany({
      where: eq(Lesson.booking_id, bookingId),
      with: {
        teacher: true,
      },
    });

    // Filter out the current lesson and extract lesson ID and teacher name
    relatedLessons = otherLessons
      .filter((otherLesson: any) => otherLesson.id !== lesson.id)
      .map((otherLesson: any) => ({
        lessonId: otherLesson.id,
        teacherName: otherLesson.teacher?.name || "Unknown Teacher",
      }));
  } catch (error) {
    console.error("Error fetching related lessons:", error);
    // Continue with empty array if query fails
  }

  return {
    totalHours, // Total hours from kite event durations (in minutes)
    studentsCount: students.length,
    kiteEventsCount: totalKiteEvents,
    studentNames,
    relatedLessons, // Array of other lessons with same booking ID
  };
}

export async function drizzleLessons(): Promise<DrizzleData<LessonType>[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Lessons");
    const lessons = await db.query.Lesson.findMany(lessonWithSort);
    const result = await Promise.all(lessons.map(parseLesson));
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Lessons");
    return result;
  } catch (error) {
    console.error("Error fetching lessons with Drizzle:", error);
    throw new Error("Failed to fetch lessons");
  }
}

export async function drizzleLessonById(
  id: string
): Promise<DrizzleData<LessonType> | null> {
  try {
    const lesson = await db.query.Lesson.findFirst({
      where: eq(Lesson.id, id),
      ...lessonsWithRelations, // Use the base relations without orderBy for single record
    });

    if (!lesson) {
      return null;
    }

    return await parseLesson(lesson);
  } catch (error) {
    console.error("Error fetching lesson by ID with Drizzle:", error);
    throw new Error("Failed to fetch lesson");
  }
}
