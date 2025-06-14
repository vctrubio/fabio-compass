import { useMemo } from "react";
import { DrizzleData } from "@/rails/types";
import { TeacherType } from "@/rails/model/TeacherModel";
import { BookingType } from "@/rails/model/BookingModel";
import { 
  ProcessedBookingData, 
  KiteEventData,
  LessonForScheduling, 
  DurationSettings, 
  TeacherAvailability 
} from "./types";

export class BookingDataProcessor {
  static processBooking(booking: DrizzleData<BookingType>): ProcessedBookingData {
    const bookingId = booking.model.id ? `#${booking.model.id.slice(-4)}` : 'Unknown';
    const relations = booking.relations as any;
    const lambdas = booking.lambdas as any;
    
    // Extract package data
    const packageData = relations?.package;
    const packageDuration = packageData?.duration || 0;
    const packagePrice = packageData?.price;
    const packageCapacity = packageData?.capacity;
    
    // Calculate price per hour
    const pricePerHour = packagePrice && packageDuration 
      ? Math.round((packagePrice / (packageDuration / 60)) * 10) / 10
      : undefined;
    
    // Extract students
    const students = (lambdas?.students || []).map((student: any) => ({
      id: student.id,
      name: student.name
    }));
    
    // Extract lessons with simplified structure
    const lessons = (relations?.lessons || []).map((lesson: any) => ({
      id: lesson.id,
      teacherName: lesson.teacher?.name,
      status: lesson.status,
      kiteEvents: (lesson.kiteEvents || []).map((event: any) => ({
        duration: event.duration || 60
      }))
    }));
    
    // Calculate total kite time
    const totalKiteTime = lessons.reduce((total: number, lesson: typeof lessons[0]) => {
      return total + lesson.kiteEvents.reduce((lessonTotal: number, event: typeof lesson.kiteEvents[0]) => {
        return lessonTotal + event.duration;
      }, 0);
    }, 0);
    
    // Calculate completion status
    const isCompleted = packageDuration > 0 && totalKiteTime >= packageDuration;
    const progressPercentage = packageDuration > 0 
      ? Math.min((totalKiteTime / packageDuration) * 100, 100)
      : 0;
    
    return {
      id: bookingId,
      booking,
      startDate: booking.model.date_start,
      endDate: booking.model.date_end,
      packagePrice,
      packageDuration,
      packageCapacity,
      pricePerHour,
      students,
      lessons,
      totalKiteTime,
      isCompleted,
      progressPercentage
    };
  }
  
  static processBookings(bookings: DrizzleData<BookingType>[]): ProcessedBookingData[] {
    return bookings.map(booking => this.processBooking(booking));
  }
}


// Time utility functions
export const TimeUtils = {
  generateTimeOptions: (): string[] => {
    const times = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        times.push(timeStr);
      }
    }
    return times;
  },

  calculateEndTime: (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
  },

  adjustTime: (
    time: string,
    hourChange: number = 0,
    minuteChange: number = 0
  ): string => {
    const [hours, minutes] = time.split(":").map(Number);
    let newHours = Math.max(0, Math.min(23, hours + hourChange));
    let newMinutes = minutes + minuteChange;

    if (newMinutes >= 60) {
      newMinutes = 0;
      newHours = Math.min(23, newHours + 1);
    } else if (newMinutes < 0) {
      newMinutes = 30;
      newHours = Math.max(0, newHours - 1);
    }

    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  },
};

// Teacher availability calculation
export const TeacherAvailabilityCalculator = {
  calculateSynchronousAvailability: (
    selectedLessons: LessonForScheduling[],
    submitTime: string,
    durations: DurationSettings,
    teacherEventLinkedList: any
  ): Record<string, TeacherAvailability> => {
    if (!teacherEventLinkedList || selectedLessons.length === 0) {
      return {};
    }

    const newAvailability: Record<string, TeacherAvailability> = {};

    // Group lessons by teacher
    const lessonsByTeacher = selectedLessons.reduce(
      (acc, lesson) => {
        if (!acc[lesson.teacherId]) {
          acc[lesson.teacherId] = [];
        }
        acc[lesson.teacherId].push(lesson);
        return acc;
      },
      {} as Record<string, LessonForScheduling[]>
    );

    // Track all calculated times to ensure no conflicts between teachers
    const allCalculatedEvents: Array<{
      teacherId: string;
      lessonId: string;
      startTime: string;
      endTime: string;
      duration: number;
    }> = [];

    // Process each teacher's lessons synchronously
    Object.entries(lessonsByTeacher).forEach(([teacherId, teacherLessons]) => {
      let currentTime = submitTime; // Each teacher starts at the original submit time

      teacherLessons.forEach((lesson, index) => {
        const lessonDuration =
          lesson.studentNames.length > 1
            ? durations.multiple
            : durations.single;

        // For lessons after the first one for this teacher, use the end time of the previous lesson
        if (index > 0) {
          const previousEvent = allCalculatedEvents
            .filter((e) => e.teacherId === teacherId)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .pop();

          if (previousEvent) {
            currentTime = previousEvent.endTime;
            console.log(
              `📅 Sequential scheduling: Lesson ${lesson.lessonId.slice(-4)} starts at ${currentTime} (after previous lesson from same teacher)`
            );
          }
        }

        // Only prepare events from the SAME teacher as conflicts for sequential scheduling
        const existingCalculatedEventsForThisTeacher = allCalculatedEvents
          .filter((event) => event.teacherId === teacherId)
          .map((event) => ({
            lessonId: event.lessonId,
            startTime: event.startTime,
            duration: event.duration,
            teacherId: event.teacherId,
          }));

        // For different teachers, they can start at the same time (submitTime)
        // Only sequential lessons from the same teacher need time adjustment
        let calculatedTime = index === 0 ? submitTime : currentTime;
        let availability: any = { conflicts: [] };

        if (index === 0) {
          // For the first lesson of each teacher, always use submitTime - no conflicts with other teachers
          calculatedTime = submitTime;
          // Still check availability against existing events for this teacher (though there should be none)
          if (teacherEventLinkedList.getTeacherLessonAvailability) {
            availability = teacherEventLinkedList.getTeacherLessonAvailability(
              teacherId,
              calculatedTime,
              lessonDuration,
              existingCalculatedEventsForThisTeacher
            );
          }
          // Override any adjustment for first lesson of each teacher
          calculatedTime = submitTime;
        } else {
          // For subsequent lessons, force sequential timing and only check against same teacher's events
          if (teacherEventLinkedList.getTeacherLessonAvailability) {
            availability = teacherEventLinkedList.getTeacherLessonAvailability(
              teacherId,
              currentTime,
              lessonDuration,
              existingCalculatedEventsForThisTeacher
            );
          }
          // Keep our sequential time regardless of availability response
          calculatedTime = currentTime;
        }

        // Calculate end time
        const endTime = TimeUtils.calculateEndTime(
          calculatedTime,
          lessonDuration
        );

        // Add to calculated events
        allCalculatedEvents.push({
          teacherId,
          lessonId: lesson.lessonId,
          startTime: calculatedTime,
          endTime,
          duration: lessonDuration,
        });

        // Store availability info
        newAvailability[lesson.lessonId] = {
          ...availability,
          calculatedTime,
          endTime,
          synchronousIndex: index,
          teacherLessonCount: teacherLessons.length,
        };

        console.log(
          `🔄 Synchronous calculation for lesson ${lesson.lessonId.slice(-4)}:`,
          {
            teacherId,
            teacherName: lesson.teacherName,
            originalSubmitTime: submitTime,
            currentTime,
            calculatedTime,
            endTime,
            lessonDuration,
            synchronousIndex: index,
            isSequential: index > 0,
            conflicts: availability?.conflicts,
            sameTeacherEventsCount:
              existingCalculatedEventsForThisTeacher.length,
            totalCalculatedEvents: allCalculatedEvents.length,
            isTimeAdjusted: calculatedTime !== submitTime,
          }
        );

        // Update current time for next lesson (this will be the start time of the next lesson)
        currentTime = endTime;
      });
    });

    return newAvailability;
  },
};

// Lesson preparation for API calls
export const LessonPreparation = {
  prepareLessonsWithCalculatedTime: (
    selectedLessons: LessonForScheduling[],
    teacherAvailability: Record<string, TeacherAvailability>,
    submitTime: string,
    durations: DurationSettings
  ) => {
    return selectedLessons.map((lesson) => {
      const calculatedTime =
        teacherAvailability[lesson.lessonId]?.calculatedTime || submitTime;
      const lessonDuration =
        lesson.studentNames.length > 1 ? durations.multiple : durations.single;
      return {
        lessonId: lesson.lessonId,
        teacherId: lesson.teacherId,
        calculatedTime: calculatedTime,
        duration: lessonDuration,
      };
    });
  },
};

interface WhiteboardData {
  teachers: DrizzleData<TeacherType>[];
  bookings: DrizzleData<BookingType>[];
}

interface ProcessedData {
  bookings: ProcessedBookingData[];
  teacherStudentMapping: TeacherStudentMapping[];
  teacherLessonEvents: TeacherLessonEvent[];
  teachers: DrizzleData<TeacherType>[];
  getDateData: (selectedDate: Date) => {
    todayBookings: ProcessedBookingData[];
    todayTeacherLessonsEvent: TeacherLessonEvent[];
    totalEvents: KiteEventData[];
    plannedEvents: KiteEventData[];
    teacherConfirmationEvents: KiteEventData[];
    availableLessonsFromBookings: Array<{
      lesson_id: string;
      booking_id: string;
      student_names: string[];
      student_ids: string[];
      hours_remaining: number;
      kite_events_count: number;
      kite_hours_completed: number;
      teacher_name?: string;
      status?: string;
    }>;
  };
}

export function useWhiteboardBackend(data: WhiteboardData): ProcessedData {
  const {
    teachers,
    bookings: rawBookings,
  } = data;

  console.log("teachers from usewhiteboard", teachers);

  return useMemo(() => {
    // Extract all lessons from booking relations
    const lessons: any[] = [];
    rawBookings.forEach((booking) => {
      const relations = booking.relations as any;
      if (relations?.lessons) {
        relations.lessons.forEach((lesson: any) => {
          lessons.push({
            ...lesson,
            // Add booking reference for easier access
            booking_id: booking.model.id
          });
        });
      }
    });
    // Sort ALL bookings: completed first, then incomplete
    const sortedAllBookings = rawBookings.sort((a, b) => {
      const aRelations = a.relations as any;
      const aLessons = aRelations?.lessons || [];
      const aPackage = aRelations?.package;
      const aPackageDuration = aPackage?.duration || 0;

      let aTotalKiteTime = 0;
      aLessons.forEach((lesson: any) => {
        const kiteEvents = lesson.kiteEvents || [];
        kiteEvents.forEach((event: any) => {
          aTotalKiteTime += event.duration || 60;
        });
      });

      const aCompleted =
        aPackageDuration > 0 && aTotalKiteTime >= aPackageDuration;

      const bRelations = b.relations as any;
      const bLessons = bRelations?.lessons || [];
      const bPackage = bRelations?.package;
      const bPackageDuration = bPackage?.duration || 0;

      let bTotalKiteTime = 0;
      bLessons.forEach((lesson: any) => {
        const kiteEvents = lesson.kiteEvents || [];
        kiteEvents.forEach((event: any) => {
          bTotalKiteTime += event.duration || 60;
        });
      });

      const bCompleted =
        bPackageDuration > 0 && bTotalKiteTime >= bPackageDuration;

      if (aCompleted !== bCompleted) {
        return aCompleted ? -1 : 1;
      }

      return (
        new Date(a.model.date_start).getTime() -
        new Date(b.model.date_start).getTime()
      );
    });

    const bookings = BookingDataProcessor.processBookings(sortedAllBookings);

    // Create teacher-student mapping through lessons
    const teacherStudentMappingMap = new Map<string, TeacherStudentMapping>();

    teachers.forEach((teacher) => {
      teacherStudentMappingMap.set(teacher.model.id, {
        teacher,
        students: [],
        lessons: [],
      });
    });

    lessons.forEach((lesson) => {
      const teacherId = lesson.teacher_id;

      if (teacherId && teacherStudentMappingMap.has(teacherId)) {
        const teacherEntry = teacherStudentMappingMap.get(teacherId)!;
        teacherEntry.lessons.push(lesson);

        // Find the booking for this lesson to get students
        const booking = rawBookings.find(b => b.model.id === lesson.booking_id);
        if (booking) {
          const relations = booking.relations as any;
          if (relations?.bookingStudents) {
            const bookingStudents = relations.bookingStudents;
            bookingStudents.forEach((bookingStudent: any) => {
              if (bookingStudent.student) {
                const studentExists = teacherEntry.students.find(
                  (s) => s.id === bookingStudent.student.id
                );
                if (!studentExists) {
                  teacherEntry.students.push(bookingStudent.student);
                }
              }
            });
          }
        }
      }
    });

    const teacherStudentMapping = Array.from(teacherStudentMappingMap.values());

    const teacherLessonEvents: TeacherLessonEvent[] = teacherStudentMapping
      .filter((mapping) => mapping.students.length > 0)
      .map((mapping) => ({
        teacher: mapping.teacher,
        lessons: mapping.lessons,
        students: mapping.students,
        totalLessonCount: mapping.lessons.length,
        hasStudents: mapping.students.length > 0,
      }));

    // Function to get date-specific data
    const getDateData = (selectedDate: Date) => {
      // Filter bookings for selected date
      const todayBookings = bookings.filter((processedBooking) => {
        const startDate = new Date(processedBooking.booking.model.date_start);
        const endDate = new Date(processedBooking.booking.model.date_end);
        const selectedDateStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        const bookingStartDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const bookingEndDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );
        return (
          selectedDateStart >= bookingStartDate &&
          selectedDateStart <= bookingEndDate
        );
      });

      // Get today's booking IDs
      const todayBookingIds = new Set(
        todayBookings.map((pb) => pb.booking.model.id)
      );

      // Filter teacher lessons for today
      const todayTeacherLessonsEvent = teacherLessonEvents
        .map((teacherEvent) => ({
          ...teacherEvent,
          lessons: teacherEvent.lessons.filter((lesson) =>
            todayBookingIds.has(lesson.booking_id)
          ),
          students: teacherEvent.students.filter((student) => {
            return teacherEvent.lessons.some((lesson) => {
              if (!todayBookingIds.has(lesson.booking_id)) return false;
              // Find the booking for this lesson to check students
              const booking = rawBookings.find(b => b.model.id === lesson.booking_id);
              if (!booking) return false;
              const relations = booking.relations as any;
              const bookingStudents = relations?.bookingStudents || [];
              return bookingStudents.some(
                (bs: any) => bs.student?.id === student.id
              );
            });
          }),
        }))
        .map((teacherEvent) => ({
          ...teacherEvent,
          totalLessonCount: teacherEvent.lessons.length,
          hasStudents: teacherEvent.students.length > 0,
        }))
        .filter((teacherEvent) => teacherEvent.lessons.length > 0);

      // Process today's kite events
      const totalEvents: KiteEventData[] = [];
      todayTeacherLessonsEvent.forEach((teacherEvent) => {
        teacherEvent.lessons.forEach((lesson) => {
          const kiteEvents = lesson.kiteEvents || [];
          // Find the booking for this lesson to get students
          const booking = rawBookings.find(b => b.model.id === lesson.booking_id);
          const relations = booking?.relations as any;
          const bookingStudents = relations?.bookingStudents || [];
          const students = bookingStudents
            .map((bs: any) => bs.student)
            .filter((student: any) => student);

          kiteEvents.forEach((kiteEvent: any) => {
            const eventDate = new Date(kiteEvent.date);
            const selectedDateStr = selectedDate.toDateString();
            const eventDateStr = eventDate.toDateString();

            if (eventDateStr === selectedDateStr) {
              const duration = kiteEvent.duration;
              if (duration && typeof duration === "number" && duration > 0) {
                // Find the processed booking data for this lesson to get pricePerHour
                const processedBooking = todayBookings.find(pb => 
                  pb.booking.model.id === lesson.booking_id
                );
                
                totalEvents.push({
                  id: kiteEvent.id,
                  lesson_id: lesson.id,
                  teacher_id: teacherEvent.teacher.model.id,
                  teacher_name: teacherEvent.teacher.model.name,
                  date: kiteEvent.date,
                  time: eventDate.toTimeString().slice(0, 5),
                  duration: duration,
                  location: kiteEvent.location || "Unknown",
                  status: kiteEvent.status || "planned",
                  students: students,
                  pricePerHour: processedBooking?.pricePerHour,
                });
              }
            }
          });
        });
      });

      // Sort events by time
      const sortedEvents = totalEvents.sort((a, b) =>
        a.time.localeCompare(b.time)
      );

      // Separate events by status
      const plannedEvents = sortedEvents.filter(
        (event) => event.status === "planned"
      );
      const teacherConfirmationEvents = sortedEvents.filter(
        (event) => event.status === "teacherConfirmation"
      );

      // Calculate available students
      const assignedStudentIds = new Set();
      sortedEvents.forEach((kiteEvent) => {
        kiteEvent.students.forEach((student) => {
          assignedStudentIds.add(student.id);
        });
      });

      const availableLessonsFromBookings = todayBookings
        .filter((processedBooking) => {
          const packageDuration = processedBooking.packageDuration;
          const totalKiteTime = processedBooking.totalKiteTime;
          const hoursRemaining = Math.max(
            0,
            (packageDuration - totalKiteTime) / 60
          );
          return hoursRemaining > 0;
        })
        .flatMap((processedBooking) => {
          const booking = processedBooking.booking;
          const relations = booking.relations as any;
          const bookingStudents = relations?.bookingStudents || [];
          const lessons = processedBooking.lessons;

          if (!lessons || lessons.length === 0) return [];

          // Get all students from the booking
          const allBookingStudents = bookingStudents
            .filter((bookingStudent: any) => bookingStudent.student)
            .map((bs: any) => bs.student);

          // Filter lessons by status (planned or ongoing) and include all students from the booking
          return lessons
            .filter(
              (lesson: any) =>
                lesson.status === "planned" || lesson.status === "ongoing"
            )
            .map((lesson: any) => {
              let lessonKiteEventsCount = 0;
              let lessonKiteHoursCompleted = 0;

              // Calculate kite events and hours for this lesson
              lesson.kiteEvents.forEach((kiteEvent: any) => {
                lessonKiteEventsCount++;
                lessonKiteHoursCompleted += kiteEvent.duration / 60;
              });

              return {
                lesson_id: lesson.id,
                booking_id: booking.model.id,
                student_names: allBookingStudents.map(
                  (student: any) => student.name
                ),
                student_ids: allBookingStudents.map(
                  (student: any) => student.id
                ),
                hours_remaining: Math.max(
                  0,
                  (processedBooking.packageDuration -
                    processedBooking.totalKiteTime) /
                    60
                ),
                kite_events_count: lessonKiteEventsCount,
                kite_hours_completed: lessonKiteHoursCompleted,
                teacher_name: lesson.teacherName,
                status: lesson.status,
              };
            });
        });

      return {
        todayBookings,
        todayTeacherLessonsEvent,
        totalEvents: sortedEvents,
        plannedEvents,
        teacherConfirmationEvents,
        availableLessonsFromBookings,
      };
    };

    return {
      bookings,
      teacherStudentMapping,
      teacherLessonEvents,
      teachers,
      getDateData,
    };
  }, [teachers, rawBookings]);
}