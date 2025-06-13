import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { Teacher } from "@/drizzle/migrations/schema";
import { TeacherType } from "@/rails/model/TeacherModel";
import { DrizzleData } from "@/rails/types";

const teachersWithRelations = {
  with: {
    lessons: {
      with: {
        booking: {
          with: {
            bookingStudents: {
              with: {
                student: true,
              },
            },
            package: true, // Added package relation here
          },
        },
        kiteEvents: true,
      },
    },
    userWallet: true,
  },
} as const;

function parseTeacher(teacher: any): DrizzleData<TeacherType> {
  const { lessons, userWallet, ...teacherModel } = teacher;

  return {
    model: teacherModel,
    relations: {
      lessons,
      userWallet,
    },
    lambdas: calculateLambdaValues(teacher),
  };
}

const teacherWithSort = {
  ...teachersWithRelations,
  orderBy: desc(Teacher.created_at), // Sort by newest first
};

function calculateLambdaValues(teacher: any) {
  const studentsMap = new Map<string, string>(); // id -> name
  let totalTeachingHours = 0;

  teacher.lessons?.forEach((lesson: any) => {
    // Extract student names from lesson bookings
    lesson.booking?.bookingStudents?.forEach((bookingStudent: any) => {
      if (bookingStudent.student?.id && bookingStudent.student?.name) {
        studentsMap.set(bookingStudent.student.id, bookingStudent.student.name);
      }
    });

    // Calculate total teaching hours from kite events
    lesson.kiteEvents?.forEach((kiteEvent: any) => {
      if (kiteEvent.duration && !isNaN(Number(kiteEvent.duration))) {
        totalTeachingHours += Number(kiteEvent.duration);
      }
    });
  });

  return {
    totalTeachingHours, // Total hours from kite event durations
    totalStudents: studentsMap.size, // Total number of unique students
    studentNames: Array.from(studentsMap.values()), // Array of student names
  };
}

export async function drizzleTeachers(): Promise<DrizzleData<TeacherType>[]> {
  try {
    const teachers = await db.query.Teacher.findMany(teacherWithSort);
    return teachers.map(parseTeacher);
  } catch (error) {
    console.error("Error fetching teachers with Drizzle:", error);
    throw new Error("Failed to fetch teachers");
  }
}

export async function drizzleTeacherById(
  id: string
): Promise<DrizzleData<TeacherType> | null> {
  try {
    const teacher = await db.query.Teacher.findFirst({
      where: eq(Teacher.id, id),
      ...teachersWithRelations, // Use the base relations without orderBy for single record
    });

    if (!teacher) {
      return null;
    }

    return parseTeacher(teacher);
  } catch (error) {
    console.error("Error fetching teacher by ID with Drizzle:", error);
    throw new Error("Failed to fetch teacher");
  }
}
