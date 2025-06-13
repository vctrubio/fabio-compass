import { z } from "zod";
import { LessonStatusEnum,  } from "./EnumModel";

// Lesson form schema
export const LessonForm = z.object({
  status: LessonStatusEnum.default("planned"),
  teacher_id: z.string().uuid().optional().nullable(),
  booking_id: z.string().uuid().optional().nullable(),
});

// Lesson schema based on the actual database schema
export const Lesson = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  booking_id: z.string().uuid(),
  status: LessonStatusEnum.default("planned"),
  created_at: z.string().optional().nullable(),
  deleted_at: z.string().optional().nullable(),
});

// Lesson with relations
export const LessonWithRelations = Lesson.extend({
  teacher: z
    .lazy(() => require("./TeacherModel").Teacher)
    .optional()
    .nullable(),
  booking: z
    .lazy(() => require("./BookingModel").Booking)
    .optional()
    .nullable(),
});

// Infer TypeScript types from Zod schemas
export type LessonType = z.infer<typeof Lesson>;
export type LessonFormType = z.infer<typeof LessonForm>;
export type LessonWithRelationsType = z.infer<typeof LessonWithRelations>;
