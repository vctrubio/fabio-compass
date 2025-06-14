import { DrizzleData } from "../types";
import { BookingType } from "./BookingModel";

export interface Student {
  id: string;
  name: string;
  languages?: string;
}

export interface Lesson {
  id: string;
  status: string;
  teacher?: { 
    id: string; 
    name: string; 
  };
  kiteEvents?: Array<{ 
    id: string; 
    duration: number; 
    date: string; 
    status?: string; 
    location?: string; 
    equipments?: Array<any>; 
  }>;
}

export interface Package {
  id: string;
  name: string;
  duration: number; // minutes
  capacity: number;
}

export class BookingClass {
  private booking: DrizzleData<BookingType>;
  
  constructor(booking: DrizzleData<BookingType>) {
    this.booking = booking;
  }

  /**
   * Get all students for this booking
   */
  getStudents(): Student[] {
    return (this.booking.lambdas as { students?: Student[] })?.students || [];
  }

  /**
   * Get the latest lesson that is ongoing or planned
   */
  getActiveLesson(): Lesson | undefined {
    const lessons = (this.booking.relations as { lessons?: Lesson[] })?.lessons || [];
    
    // First check for ongoing lessons
    const ongoingLesson = lessons.find(lesson => lesson.status?.toLowerCase() === 'ongoing');
    if (ongoingLesson) return ongoingLesson;
    
    // Then check for planned lessons
    const plannedLesson = lessons.find(lesson => lesson.status?.toLowerCase() === 'planned');
    if (plannedLesson) return plannedLesson;
    
    return undefined;
  }

  /**
   * Get all lessons for this booking
   */
  getLessons(): Lesson[] {
    return (this.booking.relations as { lessons?: Lesson[] })?.lessons || [];
  }

  /**
   * Get the associated package
   */
  getPackage(): Package | undefined {
    return (this.booking.relations as { package?: Package })?.package;
  }

  /**
   * Calculate total used minutes from all kite events
   */
  getTotalUsedMinutes(): number {
    const lessons = this.getLessons();
    const allKiteEvents = lessons.flatMap(lesson => lesson.kiteEvents || []);
    return allKiteEvents.reduce((sum, kiteEvent) => sum + (kiteEvent.duration || 0), 0);
  }

  /**
   * Get progress percentage (used vs total minutes)
   */
  getProgressPercentage(): number {
    const packageData = this.getPackage();
    if (!packageData || packageData.duration === 0) return 0;
    
    const usedMinutes = this.getTotalUsedMinutes();
    return Math.min(100, (usedMinutes / packageData.duration) * 100);
  }

  /**
   * Check if booking is active (current date falls within booking dates)
   */
  isActive(): boolean {
    const now = new Date();
    const startDate = new Date(this.booking.model.date_start);
    const endDate = new Date(this.booking.model.date_end);
    
    return now >= startDate && now <= endDate;
  }
}
