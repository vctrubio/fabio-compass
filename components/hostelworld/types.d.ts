import { DrizzleData } from "@/rails/types";
import { TeacherType } from "@/rails/model/TeacherModel";
import { BookingType } from "@/rails/model/BookingModel";

//tmp to remove
export interface TeacherEvent {
  teacher: {
    model: TeacherModel;
  };
}

// =====================================
// Booking Data Types
// =====================================

export interface ProcessedData {
  bookings: ProcessedBookingData[];
  teacherStudentMapping: TeacherStudentMapping[];
  teacherLessonEvents: TeacherLessonEvent[];
  teachers: DrizzleData<TeacherType>[];
  getDateData: (selectedDate: Date) => {
    todayTeacherLessonsEvent: TeacherLessonEvent[];
    totalEvents: KiteEventData[];
    teacherConfirmationEvents: KiteEventData[];
    availableLessonsFromBookings: LessonWithStudents[];
  };
}

export interface ProcessedBookingData {
  id: string;
  booking: DrizzleData<BookingType>;

  // Date information
  startDate?: string;
  endDate?: string;

  // Package information
  packagePrice?: number;
  packageDuration: number; // in minutes
  packageCapacity?: number;
  pricePerHour?: number;

  // Students
  students: Array<StudentModel>;

  // Lessons with simplified access
  lessons: Array<{
    id: string;
    teacherName?: string;
    status?: string;
    kiteEvents: Array<{ duration: number }>;
  }>;

  // Calculated values
  totalKiteTime: number; // in minutes
  isCompleted: boolean;
  progressPercentage: number;
}

// =====================================
// Event Data Types
// =====================================
export interface KiteEventData {
  id: string;
  lesson_id: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: string;
  teacher: TeacherModel;
  students: Array<StudentModel>;
  pricePerHour?: number;
}

// =====================================
// Teacher Types
// =====================================
export type TeacherStudentMapping = {
  teacher: DrizzleData<TeacherType>;
  students: any[];
  lessons: any[];
};

export type TeacherLessonEvent = {
  teacher: DrizzleData<TeacherType>;
  lessons: any[];
  students: any[];
  totalLessonCount: number;
  hasStudents: boolean;
};

export type TeacherAvailability = {
  calculatedTime: string;
  conflicts: any[];
  endTime?: string;
  synchronousIndex?: number;
  teacherLessonCount?: number;
};

// =====================================
// Lesson Types
// =====================================

export type DurationSettings = {
  single: number;
  multiple: number;
};

// =====================================
// Calendar Types
// =====================================
export interface TeacherModel {
  id: string;
  name: string;
}

export interface StudentModel {
  id: string;
  name: string;
}
export interface WhiteboardCalendarProps {
  selectedDate: Date;
  dateData: any;
  teacherEventLinkedList: any;
  earliestTime: string;
}

// =====================================
// Event Controller Types
// =====================================
export interface EventControllerProps {
  selectedLessons: LessonWithStudents[];
  selectedDate: Date;
  onRemoveLesson: (lessonId: string) => void;
  onClearAll: () => void;
  teacherEventLinkedList?: any;
  earliestTime: string;
  todayKiteEvents?: KiteEventData[];
}

export interface SelectedLessonsDisplayProps {
  selectedLessons: LessonWithStudents[];
  teacherAvailability: Record<string, TeacherAvailability>;
  selectedDate: Date;
  location: string;
  durations: DurationSettings;
  onRemoveLesson: (lessonId: string) => void;
}

// =====================================
// Component Types
// =====================================
// =====================================
// Student Entity Column Types
// =====================================
export interface LessonWithStudents {
  lesson_id: string;
  booking_id: string;
  students: StudentModel[];
  hours_remaining: number;
  kite_events_count: number;
  kite_hours_completed: number;
  teacher: TeacherModel;
  status: string;
  pph?: number; // price per hour
}

export interface StudentEntityColumnProps {
  lessons?: LessonWithStudents[];
  onEntityClick?: (lessonId: string) => void;
  selectedLessons?: LessonWithStudents[];
}

// =====================================
// Whiteboard Backend Types
// =====================================
export interface WhiteboardData {
  teachers: DrizzleData<TeacherType>[];
  bookings: DrizzleData<BookingType>[];
}
