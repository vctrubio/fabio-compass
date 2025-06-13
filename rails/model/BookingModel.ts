import { z } from "zod";

export const BookingForm = z.object({
  date_start: z.string().datetime(),
  date_end: z.string().datetime(),
  package_id: z.string().uuid(),
});

// Booking schema based on the actual database schema
export const Booking = z.object({
  id: z.string().uuid(),
  package_id: z.string().uuid(),
  date_start: z.string(), // timestamp
  date_end: z.string(), // timestamp
  signer_pk: z.string().uuid(), // user_wallet.id who signed the booking
  created_at: z.string().optional().nullable(),
  deleted_at: z.string().optional().nullable(),
});

export const BookingMapToStudentForm = z.object({
  booking_id: z.string().uuid(),
  student_id: z.string().uuid(),
});
  

export type BookingType = z.infer<typeof Booking>;
export type BookingFormType = z.infer<typeof BookingForm>;
export type BookingMapToStudentFormType = z.infer<typeof BookingMapToStudentForm>;
