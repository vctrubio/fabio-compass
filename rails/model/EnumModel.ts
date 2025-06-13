import { z } from "zod";

export const UserRoleEnum = z.enum([
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

export const LanguagesEnum = z.enum(["Spanish", "French", "English", "German"]);

export const TeacherRoleEnum = z.enum(["priority", "default", "freelance"]);

// Lesson Status Enum - matches schema lesson_status
export const LessonStatusEnum = z.enum([
  "planned",
  "ongoing",
  "completed",
  "delegated",
  "cancelled",
]);

// Kite Event Status Enum - matches schema kite_event_status
export const KiteEventStatusEnum = z.enum([
  "planned",
  "completed",
  "teacherConfirmation",
  "plannedAuto",
]);

// Equipment Type Enum - matches schema equipment_type
export const EquipmentTypeEnum = z.enum(["Kite", "Bar"]);

// Location Enum - matches schema location
export const LocationEnum = z.enum(["Los Lances", "Valdevaqueros"]);
