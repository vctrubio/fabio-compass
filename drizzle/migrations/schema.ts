import {
  pgTable,
  foreignKey,
  unique,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
  boolean,
  pgSchema,
} from "drizzle-orm/pg-core";

// Reference to Supabase's auth schema users table
const authSchema = pgSchema("auth");
export const users = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  // We don't need to define all columns, just the one we're referencing
});

// Define Enums
/*
lesson, kiteEvent need changing
*/

export const teacher_role = pgEnum("teacher_role", [
  "priority",
  "default",
  "freelance",
]);

export const equipmentTypeEnum = pgEnum("equipment_type", ["Kite", "Bar"]);

export const languagesEnum = pgEnum("languages", [
  "Spanish",
  "French",
  "English",
  "German",
]);

export const lessonStatusEnum = pgEnum("lesson_status", [
  "planned",
  "ongoing",
  "completed",
  "delegated",
  "cancelled",
]);

export const kiteEventStatusEnum = pgEnum("kite_event_status", [
  "planned",
  "completed",
  "teacherConfirmation",
  "plannedAuto",
]);

export const locationEnum = pgEnum("location", ["Los Lances", "Valdevaqueros"]);

export const userRole = pgEnum("user_role", [
  "guest",
  "student",
  "teacher",
  "admin",
  "teacherAdmin",
  "pendingStudent",
  "pendingTeacher",
  "pendingAdmin",
  "disabled",
]);

export const user_wallet = pgTable(
  "user_wallet",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    role: userRole().notNull(),
    email: text().notNull().unique(),
    sk: uuid().unique(),
    pk: uuid().unique(), // Polymorphic reference to student.id or teacher.id (can be null for guests)
    balance: integer().default(0), // Free money
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.sk],
      foreignColumns: [users.id],
      name: "user_wallet_sk_users_id_fk",
    }),
  ]
);

export const Student = pgTable(
  "student",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    languages: languagesEnum().array().notNull(),
    passport_number: text(),
    country: text(),
    phone: text(),
    age: integer(),
    weight: integer(),
    height: integer(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    deleted_at: timestamp({ mode: "string" }),
  },
  (table) => [index("student_id_idx").on(table.id)]
);

export const Teacher = pgTable(
  "teacher",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    languages: languagesEnum().array().notNull(),
    passport_number: text(),
    country: text(),
    phone: text(),
    teacher_role: teacher_role().default("freelance").notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    deleted_at: timestamp({ mode: "string" }),
  },
  (table) => [index("teacher_id_idx").on(table.id)]
);

export const PackageStudent = pgTable("package_student", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  price: integer().notNull(), // In euros
  duration: integer().notNull(), // In minutes
  capacity: integer().notNull(), // Capacity of students
  description: text(), // Optional description
  created_at: timestamp({ mode: "string" }).defaultNow(),
});

export const Booking = pgTable(
  "booking",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    package_id: uuid().notNull(),
    date_start: timestamp({ mode: "string" }).notNull(),
    date_end: timestamp({ mode: "string" }).notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    deleted_at: timestamp({ mode: "string" }),
    signer_pk: uuid().notNull(), // References user_wallet.sk // so who made the booking
  },
  (table) => [
    foreignKey({
      columns: [table.package_id],
      foreignColumns: [PackageStudent.id],
      name: "booking_package_id_fk",
    }),
    foreignKey({
      columns: [table.signer_pk],
      foreignColumns: [user_wallet.sk],
      name: "booking_signer_pk_fk",
    }),
  ]
);

export const BookingStudent = pgTable(
  "booking_student",
  {
    id: uuid().defaultRandom().primaryKey().notNull(), // Added primary key
    booking_id: uuid().notNull(),
    student_id: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.booking_id],
      foreignColumns: [Booking.id],
      name: "booking_student_booking_id_fk",
    }),
    foreignKey({
      columns: [table.student_id],
      foreignColumns: [Student.id],
      name: "booking_student_student_id_fk",
    }),
    unique("booking_student_unique").on(table.booking_id, table.student_id), // Keep this for business logic
    index("booking_student_booking_id_idx").on(table.booking_id),
    index("booking_student_student_id_idx").on(table.student_id),
  ]
);

export const Lesson = pgTable(
  "lesson",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teacher_id: uuid().notNull(),
    booking_id: uuid().notNull(),
    status: lessonStatusEnum().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    deleted_at: timestamp({ mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.teacher_id],
      foreignColumns: [Teacher.id],
      name: "lesson_teacher_id_fk",
    }),
    foreignKey({
      columns: [table.booking_id],
      foreignColumns: [Booking.id],
      name: "lesson_booking_id_fk",
    }),
    index("lesson_teacher_booking_id_idx").on(
      table.teacher_id,
      table.booking_id
    ),
  ]
);

export const KiteEvent = pgTable(
  "kite_event",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    lesson_id: uuid().notNull(),
    date: timestamp({ mode: "string" }).notNull(), // Added from Lesson
    duration: integer().notNull(), // Changed from hour (text) to duration (integer)
    location: locationEnum().notNull(), // Added location field
    status: kiteEventStatusEnum().notNull(), // Updated default to 'planned'
    trigger_transaction: boolean().notNull().default(false),
    created_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.lesson_id],
      foreignColumns: [Lesson.id],
      name: "kite_event_lesson_id_fk",
    }),
    index("kite_event_lesson_id_idx").on(table.lesson_id),
  ]
);

export const Transaction = pgTable(
  "transaction",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    lesson_event_id: uuid().notNull(),
    lesson_id: uuid().notNull(),
    booking_id: uuid().notNull(),
    package_id: uuid().notNull(),
    student_id: uuid().notNull(),
    teacher_id: uuid().notNull(),
    amount: integer().notNull(), // In euros
    discount_rate: integer().default(0), // In euros
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.lesson_event_id],
      foreignColumns: [KiteEvent.id],
      name: "transaction_lesson_event_id_fk",
    }),
    foreignKey({
      columns: [table.lesson_id],
      foreignColumns: [Lesson.id],
      name: "transaction_lesson_id_fk",
    }),
    foreignKey({
      columns: [table.booking_id],
      foreignColumns: [Booking.id],
      name: "transaction_booking_id_fk",
    }),
    foreignKey({
      columns: [table.package_id],
      foreignColumns: [PackageStudent.id],
      name: "transaction_package_id_fk",
    }),
    foreignKey({
      columns: [table.student_id],
      foreignColumns: [Student.id],
      name: "transaction_student_id_fk",
    }),
    foreignKey({
      columns: [table.teacher_id],
      foreignColumns: [Teacher.id],
      name: "transaction_teacher_id_fk",
    }),
  ]
);

export const Payment = pgTable(
  "payment",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    transaction_id: uuid().notNull(),
    student_confirmation: boolean().notNull(),
    amount: integer().notNull(), // In euros
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.transaction_id],
      foreignColumns: [Transaction.id],
      name: "payment_transaction_id_fk",
    }),
  ]
);

export const Commission = pgTable(
  "commission",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    transaction_id: uuid().notNull(),
    teacher_confirmation: boolean().notNull(),
    amount: integer().notNull(), // In euros
    commission_rate: teacher_role().default("freelance").notNull(),
    admin_confirmation: boolean().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.transaction_id],
      foreignColumns: [Transaction.id],
      name: "commission_transaction_id_fk",
    }),
  ]
);

export const Equipment = pgTable(
  "equipment",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    serial_id: text().notNull().unique(),
    type: equipmentTypeEnum().notNull(),
    model: text().notNull(),
    size: integer().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [index("equipment_serial_id_idx").on(table.serial_id)]
);

export const KiteEventEquipment = pgTable(
  "kite_event_equipment",
  {
    id: uuid().defaultRandom().primaryKey().notNull(), // Added primary key
    kite_event_id: uuid().notNull(),
    equipment_id: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.kite_event_id],
      foreignColumns: [KiteEvent.id],
      name: "kite_event_equipment_kite_event_id_fk",
    }),
    foreignKey({
      columns: [table.equipment_id],
      foreignColumns: [Equipment.id],
      name: "kite_event_equipment_equipment_id_fk",
    }),
    unique("kite_event_equipment_unique").on(
      table.kite_event_id,
      table.equipment_id
    ),
    index("kite_event_equipment_kite_event_id_idx").on(table.kite_event_id),
    index("kite_event_equipment_equipment_id_idx").on(table.equipment_id),
  ]
);
