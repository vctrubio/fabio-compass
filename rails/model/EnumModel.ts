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

export const LanguagesEnum = z.enum([
  "Spanish",
  "French",
  "English", 
  "German",
]);

export const TeacherRoleEnum = z.enum([
  "priority",
  "default", 
  "freelance",
]);