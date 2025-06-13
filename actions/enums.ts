import { ApiAction } from "@/rails/types";
import { updateLessonStatus } from "./lesson-actions";
import { updateKiteEventStatus } from "./kite-actions";

// Lesson Status Colors - maps to LessonStatusEnum values
export const LESSON_STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-200 text-gray-900",
  ongoing: "bg-blue-200 text-blue-900",
  completed: "bg-green-200 text-green-900",
  delegated: "bg-orange-200 text-orange-900",
  cancelled: "bg-red-200 text-red-900",
};

// Kite Event Status Colors - maps to KiteEventStatusEnum values
export const KITE_EVENT_STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-200 text-gray-900",
  plannedAuto: "bg-gray-200 text-gray-900",
  completed: "bg-green-200 text-green-900",
  teacherConfirmation: "bg-purple-200 text-purple-900",
};

// Helper function to get status color with fallback
export function getLessonStatusColor(status: string): string {
  return LESSON_STATUS_COLORS[status] || LESSON_STATUS_COLORS.planned;
}

export function getKiteEventStatusColor(status: string): string {
  return KITE_EVENT_STATUS_COLORS[status] || KITE_EVENT_STATUS_COLORS.planned;
}

export async function updateLessonIdStatus(
  lesson: { id: string; status: string },
  newStatus: string
): Promise<ApiAction> {
  console.log("Requesting lesson status update:", lesson.id, newStatus);

  const result = await updateLessonStatus(lesson.id, newStatus);

  console.log("Lesson update result:", result);

  return result;
}

export async function updateKiteEventIdStatus(
  event: { id: string; status: string },
  newStatus: string
): Promise<ApiAction> {
  console.log("Requesting kite event status update:", event.id, newStatus);

  const result = await updateKiteEventStatus(event.id, newStatus);

  console.log("Kite event update result:", result);

  return result;
}
