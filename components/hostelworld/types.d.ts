import { DrizzleData } from "@/rails/types";
import { TeacherType } from "@/rails/model/TeacherModel";
import { BookingType } from "@/rails/model/BookingModel";

// =====================================
// Booking Data Types
// =====================================
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
  students: Array<{ id: string; name: string }>;
  
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
  teacher_id: string;
  teacher_name: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: string;
  students: any[];
  equipmentItems?: any[];
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
export type LessonForScheduling = {
  lessonId: string;
  studentNames: string[];
  teacherName: string;
  teacherId: string;
};

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

export interface TeacherEvent {
  teacher: {
    model: TeacherModel;
  };
}

export interface WhiteboardCalendarProps {
  bookingsData: DrizzleData<BookingType>[];
  whiteboardData: any;
  selectedDate: Date;
  dateData: any;
  teacherEventLinkedList: any;
  earliestTime: string;
}

// =====================================
// Event Controller Types
// =====================================
export interface EventControllerProps {
  selectedLessons: LessonForScheduling[];
  selectedDate: Date;
  onRemoveLesson: (lessonId: string) => void;
  onClearAll: () => void;
  teacherEventLinkedList?: any;
  earliestTime: string;
}

export interface SelectedLessonsDisplayProps {
  selectedLessons: LessonForScheduling[];
  teacherAvailability: Record<string, TeacherAvailability>;
  selectedDate: Date;
  location: string;
  durations: DurationSettings;
  onRemoveLesson: (lessonId: string) => void;
}

// =====================================
// Component Types
// =====================================
export interface StudentEntityColumnProps {
  lessons: any[];
  onEntityClick: (lessonId: string) => void;
  selectedLessons: any[];
}

export interface TeacherEntityColumnProps {
  teachers: any[];
  onEntityClick: (teacherId: string) => void;
  selectedTeachers: any[];
}