// Revalidation path constant
export const REVALIDATE_PATH = "/fabio";

// Lesson Status Colors - maps to LessonStatusEnum values
export const LESSON_STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-100",
  ongoing: "bg-blue-100",
  completed: "bg-green-100",
  delegated: "bg-yellow-100",
  cancelled: "bg-red-100",
};

// Kite Event Status Colors - maps to KiteEventStatusEnum values
export const KITE_EVENT_STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-100",
  plannedAuto: "bg-gray-100", // Fixed typo: was "bg-grey-100"
  completed: "bg-green-100",
  teacherConfirmation: "bg-orange-100",
};

// Helper function to get status color with fallback
export function getLessonStatusColor(status: string): string {
  return LESSON_STATUS_COLORS[status] || LESSON_STATUS_COLORS.planned;
}

export function getKiteEventStatusColor(status: string): string {
  return KITE_EVENT_STATUS_COLORS[status] || KITE_EVENT_STATUS_COLORS.planned;
}
