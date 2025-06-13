import { z } from "zod";
import { TeacherRoleEnum, LanguagesEnum } from "./";
// Teacher form schema
export const TeacherForm = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  languages: z.array(LanguagesEnum).optional().nullable(),
  passport_number: z.string().optional().nullable(),
  teacher_role: TeacherRoleEnum.default("freelance"),
});

// Teacher schema based on the actual database schema
export const Teacher = TeacherForm.extend({
  id: z.string().uuid(),
  email: z.string().email("Invalid email format").optional().nullable(),
  created_at: z.string().optional().nullable(),
  deleted_at: z.string().optional().nullable(),
});

// Infer TypeScript types from Zod schemas
export type TeacherType = z.infer<typeof Teacher>;
export type TeacherFormType = z.infer<typeof TeacherForm>;
