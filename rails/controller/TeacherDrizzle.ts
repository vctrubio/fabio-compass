import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { Teacher } from "@/drizzle/migrations/schema";
import { TeacherType } from "@/rails/model/TeacherModel";
import { DrizzleData } from "@/rails/types";
import { KiteEventData } from "@/components/hostelworld/types";

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
  let totalLessons = 0;
  let totalKiteEvents = 0;

  teacher.lessons?.forEach((lesson: any) => {
    totalLessons++;
    // Extract student names from lesson bookings
    lesson.booking?.bookingStudents?.forEach((bookingStudent: any) => {
      if (bookingStudent.student?.id && bookingStudent.student?.name) {
        studentsMap.set(bookingStudent.student.id, bookingStudent.student.name);
      }
    });

    // Calculate total teaching hours from kite events
    lesson.kiteEvents?.forEach((kiteEvent: any) => {
      totalKiteEvents++;
      if (kiteEvent.duration && !isNaN(Number(kiteEvent.duration))) {
        totalTeachingHours += Number(kiteEvent.duration);
      }
    });
  });

  return {
    totalTeachingHours,
    totalStudents: studentsMap.size,
    studentNames: Array.from(studentsMap.values()),
    totalLessons,
    totalKiteEvents,
  };
}

export async function drizzleTeachers(): Promise<DrizzleData<TeacherType>[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Teachers");
    const teachers = await db.query.Teacher.findMany(teacherWithSort);
    const result = teachers.map(parseTeacher);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Teachers");
    return result;
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

export async function drizzleKiteEvents(): Promise<KiteEventData[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: KiteEvent");
    const kiteEvents = await db.query.KiteEvent.findMany({
      with: {
        lesson: {
          with: {
            booking: {
              with: {
                bookingStudents: {
                  with: {
                    student: true,
                  },
                },
              },
            },
          },
        },
        kiteEventEquipment: {
          with: {
            equipment: true,
          },
        },
      },
    });

    const result: KiteEventData[] = kiteEvents.map((kiteEvent) => {
      const students =
        kiteEvent.lesson?.booking?.bookingStudents?.map((bs) => ({
          id: bs.student.id,
          name: bs.student.name,
        })) || [];

      const equipments =
        kiteEvent.kiteEventEquipment?.map((kee) => ({
          id: kee.equipment.id,
          type: kee.equipment.type,
          model: kee.equipment.model,
          size: kee.equipment.size,
        })) || [];

      return {
        id: kiteEvent.id,
        date: kiteEvent.date,
        time: new Date(kiteEvent.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: kiteEvent.duration,
        location: kiteEvent.location,
        status: kiteEvent.status,
        lesson_id: kiteEvent.lesson_id,
        students,
        equipments,
      };
    });

    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: KiteEvent");
    return result;
  } catch (error) {
    console.error("Error fetching kite events with Drizzle:", error);
    throw new Error("Failed to fetch kite events");
  }
}
