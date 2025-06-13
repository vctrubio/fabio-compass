import { z } from "zod";

export const PaymentForm = z.object({
  amount: z.number().positive("Amount must be positive"),
  transaction_id: z.string().uuid().optional().nullable(),
  student_confirmation: z.boolean().default(false),
  payment_method: z.enum(['cash', 'card', 'transfer', 'online']).optional().nullable(),
  payment_date: z.string().datetime().optional().nullable(),
});

// Payment schema based on the actual database schema
export const Payment = z.object({
  id: z.string().uuid(),
  transaction_id: z.string().uuid(),
  student_confirmation: z.boolean(),
  amount: z.number().int(), // In cents/smallest currency unit
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

// Payment with relations - student accessed via transaction.student
export const PaymentWithRelations = Payment.extend({
  transaction: z.lazy(() => require('./TransactionModel').Transaction).optional().nullable(),
});

export type PaymentType = z.infer<typeof Payment>;
export type PaymentFormType = z.infer<typeof PaymentForm>;
export type PaymentWithRelationsType = z.infer<typeof PaymentWithRelations>;
