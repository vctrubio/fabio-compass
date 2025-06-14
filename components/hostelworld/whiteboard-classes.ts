import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { ProcessedBookingData } from "./whiteboard-backend";

/**
 * Centralized styling utility for whiteboard components
 * Provides consistent color coding across all booking displays
 */
export class WhiteboardStyles {
    /**
     * CSS classes for different booking states
     */
    static readonly CLASSES = {
        // Green: Booking has kite events for today/selected date
        HAS_KITE_EVENTS_TODAY: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
        
        // Orange: Booking has lessons but no kite events for today/selected date
        HAS_LESSONS_NO_KITE_EVENTS: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
        
        // Grey: Booking progress is not completed
        PROGRESS_NOT_COMPLETED: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600",
        
        // Default: All other states
        DEFAULT: "bg-gray-50 dark:bg-gray-800"
    } as const;

    /**
     * Helper function to check if two dates are the same day
     */
    private static isSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    /**
     * Get header class name for a booking using whiteboard backend data (preferred method)
     */
    static getBookingHeaderClass(
        booking: DrizzleData<BookingType>,
        selectedDate?: Date,
        whiteboardData?: {
            bookings: ProcessedBookingData[];
            getDateData: (date: Date) => {
                totalEvents: Array<{ lesson_id: string; [key: string]: unknown }>;
            };
        }
    ): string {
        // If we have whiteboard data, use the processed booking data
        if (whiteboardData) {
            const processedBooking = whiteboardData.bookings.find(
                (pb: ProcessedBookingData) => pb.booking.model.id === booking.model.id
            );

            if (processedBooking) {
                // Check if this booking has kite events for the selected date
                const targetDate = selectedDate || new Date();
                const dateData = whiteboardData.getDateData(targetDate);
                
                const hasKiteEventsToday = dateData.totalEvents.some((event: { lesson_id: string }) => 
                    processedBooking.lessons.some((lesson: { id: string }) => lesson.id === event.lesson_id)
                );

                if (hasKiteEventsToday) {
                    // Green: Booking has kite events for today
                    return this.CLASSES.HAS_KITE_EVENTS_TODAY;
                }

                // Check if booking has lessons but no kite events for today
                if (processedBooking.lessons.length > 0) {
                    // Orange: Has lessons but no kite events for today
                    return this.CLASSES.HAS_LESSONS_NO_KITE_EVENTS;
                }

                // Default styling (no lessons or other states)
                return this.CLASSES.DEFAULT;
            }
        }

        // Fallback to basic logic if no whiteboard data is available
        return this.getBookingHeaderClassBasic(booking, selectedDate);
    }

    /**
     * Fallback method for getting header class without whiteboard backend data
     */
    static getBookingHeaderClassBasic(
        booking: DrizzleData<BookingType>,
        selectedDate?: Date
    ): string {
        const lessons = (booking.relations as { lessons?: Array<{ 
            id: string; 
            kiteEvents?: Array<{ date: string; duration: number }> 
        }> })?.lessons || [];

        // Check if booking has kite events for the selected date
        const targetDate = selectedDate || new Date();
        
        const hasKiteEventsToday = lessons.some(lesson => 
            lesson.kiteEvents?.some(kiteEvent => {
                const kiteEventDate = new Date(kiteEvent.date);
                return this.isSameDay(kiteEventDate, targetDate);
            })
        );

        if (hasKiteEventsToday) {
            // Green: Booking has kite events for today
            return this.CLASSES.HAS_KITE_EVENTS_TODAY;
        }

        // Check if booking has lessons but no kite events for today
        if (lessons.length > 0) {
            // Orange: Has lessons but no kite events for today
            return this.CLASSES.HAS_LESSONS_NO_KITE_EVENTS;
        }

        // Default styling
        return this.CLASSES.DEFAULT;
    }

    /**
     * Get progress-based styling (for components that care about completion status)
     */
    static getProgressBasedClass(
        booking: DrizzleData<BookingType>,
        selectedDate?: Date,
        whiteboardData?: {
            bookings: ProcessedBookingData[];
            getDateData: (date: Date) => {
                totalEvents: Array<{ lesson_id: string; [key: string]: unknown }>;
            };
        }
    ): string {
        // If we have whiteboard data, use the processed booking data
        if (whiteboardData) {
            const processedBooking = whiteboardData.bookings.find(
                (pb: ProcessedBookingData) => pb.booking.model.id === booking.model.id
            );

            if (processedBooking) {
                // Check if this booking has kite events for the selected date
                const targetDate = selectedDate || new Date();
                const dateData = whiteboardData.getDateData(targetDate);
                
                const hasKiteEventsToday = dateData.totalEvents.some((event: { lesson_id: string }) => 
                    processedBooking.lessons.some((lesson: { id: string }) => lesson.id === event.lesson_id)
                );

                if (hasKiteEventsToday) {
                    // Green: Booking has kite events for today
                    return this.CLASSES.HAS_KITE_EVENTS_TODAY;
                }

                // Check if booking has lessons but no kite events for today
                if (processedBooking.lessons.length > 0) {
                    // Orange: Has lessons but no kite events for today
                    return this.CLASSES.HAS_LESSONS_NO_KITE_EVENTS;
                }

                // Check if progress is not completed
                if (processedBooking.lessons.length > 0 && !processedBooking.isCompleted) {
                    // Grey: Has lessons but progress not completed
                    return this.CLASSES.PROGRESS_NOT_COMPLETED;
                }

                // Default styling (completed bookings or bookings without lessons)
                return this.CLASSES.DEFAULT;
            }
        }

        // Fallback to basic logic
        return this.getProgressBasedClassBasic(booking, selectedDate);
    }

    /**
     * Fallback progress-based styling without whiteboard backend data
     */
    static getProgressBasedClassBasic(
        booking: DrizzleData<BookingType>,
        selectedDate?: Date
    ): string {
        const lessons = (booking.relations as { lessons?: Array<{ 
            id: string; 
            kiteEvents?: Array<{ date: string; duration: number }> 
        }> })?.lessons || [];

        const packageData = (booking.relations as { package?: { duration: number } })?.package;
        const packageMinutes = packageData?.duration || 0;
        const totalKitingMinutes = lessons.reduce((sum, lesson) => {
            return sum + (lesson.kiteEvents || []).reduce((kitingSum, kiteEvent) => 
                kitingSum + (kiteEvent.duration || 0), 0);
        }, 0);
        
        const isProgressCompleted = packageMinutes > 0 && totalKitingMinutes >= packageMinutes;

        // Check if booking has kite events for the selected date
        const targetDate = selectedDate || new Date();
        
        const hasKiteEventsToday = lessons.some(lesson => 
            lesson.kiteEvents?.some(kiteEvent => {
                const kiteEventDate = new Date(kiteEvent.date);
                return this.isSameDay(kiteEventDate, targetDate);
            })
        );

        if (hasKiteEventsToday) {
            // Green: Booking has kite events for today
            return this.CLASSES.HAS_KITE_EVENTS_TODAY;
        }

        // Check if booking has lessons but no kite events for today
        if (lessons.length > 0) {
            // Orange: Has lessons but no kite events for today
            return this.CLASSES.HAS_LESSONS_NO_KITE_EVENTS;
        }

        // Check if progress is not completed
        if (lessons.length > 0 && !isProgressCompleted) {
            // Grey: Has lessons but progress not completed
            return this.CLASSES.PROGRESS_NOT_COMPLETED;
        }

        // Default styling
        return this.CLASSES.DEFAULT;
    }
}

/**
 * Type definitions for styling options
 */
export type BookingStyleMethod = 'basic' | 'progress-based';

/**
 * Convenience function for components that want simple booking styling
 */
export function getBookingHeaderClass(
    booking: DrizzleData<BookingType>,
    selectedDate?: Date,
    whiteboardData?: {
        bookings: ProcessedBookingData[];
        getDateData: (date: Date) => {
            totalEvents: Array<{ lesson_id: string; [key: string]: unknown }>;
        };
    },
    method: BookingStyleMethod = 'basic'
): string {
    if (method === 'progress-based') {
        return WhiteboardStyles.getProgressBasedClass(booking, selectedDate, whiteboardData);
    }
    return WhiteboardStyles.getBookingHeaderClass(booking, selectedDate, whiteboardData);
}
