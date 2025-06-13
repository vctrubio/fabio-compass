import React from "react";

// Import all icons
import {
  HelmetIcon,
  HeadsetIcon,
  BookingIcon,
  FlagIcon,
  KiteIcon,
  EquipmentIcon,
  PackageIcon,
  PaymentIcon,
  AdminIcon,
} from "@/assets/svg";

// Import str components
import { BookingStr } from "@/rails/view/str/BookingStr";
import { StudentStr } from "@/rails/view/str/StudentStr";
import { TeacherStr } from "@/rails/view/str/TeacherStr";
import { LessonStr } from "@/rails/view/str/LessonStr";
import { KiteEventStr } from "@/rails/view/str/KiteEventStr";
import { EquipmentStr } from "@/rails/view/str/EquipmentStr";
import PackageStr from "@/rails/view/str/PackageStr";

// Import tag components
import { BookingTag } from "@/rails/view/tag/BookingTag";
import { StudentTag } from "@/rails/view/tag/StudentTag";
import { TeacherTag } from "@/rails/view/tag/TeacherTag";
import { LessonTag } from "@/rails/view/tag/LessonTag";
import { KiteEventTag } from "@/rails/view/tag/KiteEventTag";
import { EquipmentTag } from "@/rails/view/tag/EquipmentTag";
import PackageTag from "@/rails/view/tag/PackageTag";

// Entity colors configuration
export const ENTITY_COLORS = {
  students: {
    primary: "hsl(var(--orange-cabrinha))", // Orange-cabrinha from globals.css
    secondary: "#FEF3C7", // Light orange/yellow background
    text: "text-orange-800", // Orange text
    ring: "ring-orange-500",
  },
  teachers: {
    primary: "hsl(var(--green-mqueen))", // Green-mqueen from globals.css
    secondary: "#D1FAE5",
    text: "text-emerald-100",
    ring: "ring-emerald-600",
  },
  admin: {
    primary: "hsl(var(--blue-reach))", // Blue-reach from globals.css
    secondary: "#DBEAFE", // Light blue background
    text: "text-blue-800",
    ring: "ring-blue-500",
  },
  bookings: {
    primary: "#3B82F6", // Brighter marine blue
    secondary: "#DBEAFE",
    text: "text-blue-100",
    ring: "ring-blue-600",
  },
  lessons: {
    primary: "#06B6D4", // Neon blue
    secondary: "#CFFAFE",
    text: "text-cyan-800",
    ring: "ring-cyan-500",
  },
  kiteEvents: {
    primary: "#15803D", // True green
    secondary: "#DCFCE7",
    text: "text-green-100",
    ring: "ring-green-700",
  },
  equipments: {
    primary: "#7C3AED", // Purple
    secondary: "#EDE9FE",
    text: "text-violet-100",
    ring: "ring-violet-600",
  },
  packages: {
    primary: "#DC2626", // Red
    secondary: "#FEE2E2",
    text: "text-red-100",
    ring: "ring-red-600",
  },
  payments: {
    primary: "#10B981", // Green (matches icon color)
    secondary: "#D1FAE5",
    text: "text-emerald-100",
    ring: "ring-emerald-600",
  },
};

// Entity type definitions
export type EntityType =
  | "students"
  | "teachers"
  | "admin"
  | "bookings"
  | "lessons"
  | "kiteEvents"
  | "equipments"
  | "packages"
  | "payments";

// Entity configuration interface
export interface EntityConfig {
  key: EntityType;
  title: string;
  titleSingular: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: React.ComponentType<any> | null;
  str: React.ComponentType<any> | null;
  searchFields: string[];
  RowComponent: React.ComponentType<any> | null;
  FormComponent: React.ComponentType<any> | null;
}

// Centralized entity configuration
export const ENTITY_CONFIGS: Record<EntityType, EntityConfig> = {
  students: {
    key: "students",
    title: "Students",
    titleSingular: "Student",
    icon: HelmetIcon,
    tag: StudentTag,
    str: StudentStr,
    searchFields: ["name", "id", "email", "phone", "passport_number"],
    RowComponent: null,
    FormComponent: null,
  },
  teachers: {
    key: "teachers",
    title: "Teachers",
    titleSingular: "Teacher",
    icon: HeadsetIcon,
    tag: TeacherTag,
    str: TeacherStr,
    searchFields: [
      "name",
      "id",
      "email",
      "phone",
      "passport_number",
      "teacher_role",
      "country",
      "languages",
    ],
    RowComponent: null,
    FormComponent: null,
  },
  admin: {
    key: "admin",
    title: "Admins",
    titleSingular: "Admin",
    icon: AdminIcon,
    tag: null,
    str: null,
    searchFields: ["name", "id", "email", "phone", "role"],
    RowComponent: null,
    FormComponent: null,
  },
  bookings: {
    key: "bookings",
    title: "Bookings",
    titleSingular: "Booking",
    icon: BookingIcon,
    tag: BookingTag,
    str: BookingStr,
    searchFields: [
      "id",
      "startDate",
      "endDate",
      "status",
      "totalKiteTime",
      "packageDuration",
    ],
    RowComponent: null,
    FormComponent: null,
  },
  lessons: {
    key: "lessons",
    title: "Lessons",
    titleSingular: "Lesson",
    icon: FlagIcon,
    tag: LessonTag,
    str: LessonStr,
    searchFields: ["id", "status", "teacherName", "date", "bookingId"],
    RowComponent: null,
    FormComponent: null,
  },
  kiteEvents: {
    key: "kiteEvents",
    title: "Kite Events",
    titleSingular: "Kite Event",
    icon: KiteIcon,
    tag: KiteEventTag,
    str: KiteEventStr,
    searchFields: ["id", "lessonId", "status", "location", "duration", "date"],
    RowComponent: null,
    FormComponent: null,
  },
  equipments: {
    key: "equipments",
    title: "Equipment",
    titleSingular: "Equipment",
    icon: EquipmentIcon,
    tag: EquipmentTag,
    str: EquipmentStr,
    searchFields: [
      "id",
      "serialId",
      "type",
      "model",
      "size",
    ],
    RowComponent: null,
    FormComponent: null,
  },
  packages: {
    key: "packages",
    title: "Packages",
    titleSingular: "Package",
    icon: PackageIcon,
    tag: PackageTag,
    str: PackageStr,
    searchFields: ["duration", "price", "capacity", "description"],
    RowComponent: null,
    FormComponent: null,
  },
  payments: {
    key: "payments",
    title: "Payments",
    titleSingular: "Payment",
    icon: PaymentIcon,
    tag: null,
    str: null,
    searchFields: [
      "amount",
      "transaction_id",
      "transaction.student.name",
      "transaction.student.email",
    ],
    RowComponent: null,
    FormComponent: null,
  },
};
