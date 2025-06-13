import { z } from "zod";
import { LessonStatusEnum } from "./EnumModel";

// Transaction form schema
export const TransactionForm = z.object({
  amount: z.number().positive("Amount must be positive"),
  discount_rate: z.number().min(0).max(100).optional().nullable(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).default('pending'),
  lesson_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
});

// Transaction schema based on the actual database schema
export const Transaction = z.object({
  id: z.string().uuid(),
  lesson_event_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  booking_id: z.string().uuid(),
  package_id: z.string().uuid(),
  student_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  amount: z.number().int(), // In cents/smallest currency unit
  discount_rate: z.number().int().default(0),
  status: LessonStatusEnum,
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

// Transaction with relationships
export const TransactionWithRelations = Transaction.extend({
  lesson: z.lazy(() => require('./LessonModel').Lesson).optional().nullable(),
  payments: z.array(z.lazy(() => require('./PaymentModel').Payment)).optional().nullable(),
});

// Infer TypeScript types from Zod schemas
export type TransactionType = z.infer<typeof Transaction>;
export type TransactionFormType = z.infer<typeof TransactionForm>;
export type TransactionWithRelationsType = z.infer<typeof TransactionWithRelations>;
