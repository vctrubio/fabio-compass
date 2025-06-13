import { z } from "zod";
import { UserRoleEnum } from "./";

export const User = z.object({
  id: z.string().uuid(),
  role: UserRoleEnum,
  email: z.string().email(),
  sk: z.string().uuid().nullable(), // Secret key, pointing to auth.users.id (can be null in DB)
  pk: z.string().uuid().nullable(), // Polymorphic reference to student.id or teacher.id (can be null in DB)
  balance: z.number().int().nullable(), // Free money (can be null in DB)
  created_at: z.string().nullable(), // Timestamp (can be null in DB)
  updated_at: z.string().nullable(), // Timestamp (can be null in DB)
});

export type UserType = z.infer<typeof User>;
