import { z } from "zod";

// PackageStudent schema (renamed from LessonPackage for better clarity)
export const PackageStudent = z.object({
  id: z.string().uuid(),
  price: z.number().int(), // In euros
  duration: z.number().int(), // In minutes
  capacity: z.number().int(), // Capacity of students
  description: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
});

// Infer TypeScript type from Zod schema
export type PackageStudentType = z.infer<typeof PackageStudent>;

// Legacy alias for backward compatibility (can be removed later)
export const LessonPackage = PackageStudent;
export type LessonPackageType = PackageStudentType;
