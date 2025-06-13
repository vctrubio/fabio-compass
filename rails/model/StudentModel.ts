import { z } from "zod";
import { LanguagesEnum } from "./";

export const StudentWelcomeForm = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().optional().nullable(),
  country: z.string().optional().nullable(),
  passport_number: z.string().optional().nullable(),
  weight: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  languages: z.array(LanguagesEnum).min(1, "At least one language must be selected"),
  phone: z.string().optional().nullable(),
});

// Student schema based on the actual database schema
export const Student = StudentWelcomeForm.extend({
  id: z.string().uuid(),
  email: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  deleted_at: z.string().optional().nullable(),
});

export type StudentWelcomeFormType = z.infer<typeof StudentWelcomeForm>;
export type StudentType = z.infer<typeof Student>;