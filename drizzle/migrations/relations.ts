import { relations } from "drizzle-orm/relations";
import {
  users,
  user_wallet,
  Student,
  Teacher,
  PackageStudent,
  Booking,
  BookingStudent,
  Lesson,
  KiteEvent,
  Transaction,
  Payment,
  Commission,
  Equipment,
  KiteEventEquipment,
} from "./schema";

export const userWalletRelations = relations(user_wallet, ({ one }) => ({
  usersInAuth: one(users, {
    fields: [user_wallet.sk],
    references: [users.id],
  }),
  student: one(Student, {
    fields: [user_wallet.pk],
    references: [Student.id],
  }),
  teacher: one(Teacher, {
    fields: [user_wallet.pk],
    references: [Teacher.id],
  }),
}));

export const usersInAuthRelations = relations(users, ({ many }) => ({
  userWallets: many(user_wallet),
}));

export const studentRelations = relations(Student, ({ many, one }) => ({
  userWallet: one(user_wallet, {
    fields: [Student.id],
    references: [user_wallet.pk],
  }),
  bookingStudents: many(BookingStudent), // students can have many bookings
  transactions: many(Transaction), // students can have many transactions
}));

export const teacherRelations = relations(Teacher, ({ many, one }) => ({
  userWallet: one(user_wallet, {
    fields: [Teacher.id],
    references: [user_wallet.pk],
  }),
  lessons: many(Lesson),
}));

export const packageStudentRelations = relations(
  PackageStudent,
  ({ many }) => ({
    bookings: many(Booking),
  })
);

export const bookingRelations = relations(Booking, ({ one, many }) => ({
  package: one(PackageStudent, {
    fields: [Booking.package_id],
    references: [PackageStudent.id],
  }),
  signer: one(user_wallet, {
    fields: [Booking.signer_pk],
    references: [user_wallet.sk], //it will tell u who is auth.user.id
  }),
  bookingStudents: many(BookingStudent),
  lessons: many(Lesson), //many lessons that are created when booking student is created
}));

export const bookingStudentRelations = relations(BookingStudent, ({ one }) => ({
  booking: one(Booking, {
    fields: [BookingStudent.booking_id],
    references: [Booking.id],
  }),
  student: one(Student, {
    fields: [BookingStudent.student_id],
    references: [Student.id],
  }),
}));

export const lessonRelations = relations(Lesson, ({ one, many }) => ({
  teacher: one(Teacher, {
    fields: [Lesson.teacher_id],
    references: [Teacher.id],
  }),
  booking: one(Booking, {
    fields: [Lesson.booking_id],
    references: [Booking.id],
  }),
  kiteEvents: many(KiteEvent), // one lesson can have many kite events
}));

export const kiteEventRelations = relations(KiteEvent, ({ one, many }) => ({
  lesson: one(Lesson, {
    fields: [KiteEvent.lesson_id],
    references: [Lesson.id],
  }),
  transactions: one(Transaction, {
    fields: [KiteEvent.id],
    references: [Transaction.lesson_event_id],
  }),
  kiteEventEquipments: many(KiteEventEquipment), // one kite event can have many equipment items
}));

export const transactionRelations = relations(Transaction, ({ one, many }) => ({
  kiteEvent: one(KiteEvent, {
    fields: [Transaction.lesson_event_id],
    references: [KiteEvent.id],
  }),
  lesson: one(Lesson, {
    fields: [Transaction.lesson_id],
    references: [Lesson.id],
  }),
  booking: one(Booking, {
    fields: [Transaction.booking_id],
    references: [Booking.id],
  }),
  package: one(PackageStudent, {
    fields: [Transaction.package_id],
    references: [PackageStudent.id],
  }),
  student: one(Student, {
    fields: [Transaction.student_id],
    references: [Student.id],
  }),
  teacher: one(Teacher, {
    fields: [Transaction.teacher_id],
    references: [Teacher.id],
  }),
  payments: many(Payment), // one transaction can have many payments
  commissions: many(Commission), // one transaction can have many commissions
}));

export const paymentRelations = relations(Payment, ({ one }) => ({
  transaction: one(Transaction, {
    fields: [Payment.transaction_id],
    references: [Transaction.id],
  }),
}));

export const commissionRelations = relations(Commission, ({ one }) => ({
  transaction: one(Transaction, {
    fields: [Commission.transaction_id],
    references: [Transaction.id],
  }),
}));

export const equipmentRelations = relations(Equipment, ({ many }) => ({
  kiteEventEquipments: many(KiteEventEquipment),
}));

export const kiteEventEquipmentRelations = relations(KiteEventEquipment, ({ one }) => ({
  kiteEvent: one(KiteEvent, {
    fields: [KiteEventEquipment.kite_event_id],
    references: [KiteEvent.id],
  }),
  equipment: one(Equipment, {
    fields: [KiteEventEquipment.equipment_id],
    references: [Equipment.id],
  }),
}));
