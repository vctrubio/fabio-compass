import { z } from "zod";
import { TeacherRoleEnum } from "./EnumModel";

// Commission schema
export const Commission = z.object({
  id: z.string().uuid(),
  transaction_id: z.string().uuid(),
  teacher_confirmation: z.boolean(),
  amount: z.number().int(), // In euros
  commission_rate: TeacherRoleEnum.default("freelance"),
  admin_confirmation: z.boolean(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

// Infer TypeScript type from Zod schema
export type CommissionType = z.infer<typeof Commission>;
