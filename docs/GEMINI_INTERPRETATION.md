# GEMINI INTERPRETATION: Codebase Analysis and Abstraction Proposal

This document provides an analysis of the `whiteboard-backend.ts` file, identifying its current structure, responsibilities, and proposing a more abstracted, class-based approach for improved code organization, readability, and maintainability.

## Current Codebase Overview (`whiteboard-backend.ts`)

The existing file combines several distinct logical units, primarily exposed as static utility objects and a large React `useMemo` hook. While functional, this structure can lead to a less clear separation of concerns and make testing individual components more challenging.

- **`BookingDataProcessor`**: A static class responsible for processing raw booking data into a more consumable format.
- **`TimeUtils`**: A static object providing general time calculation utilities.
- **`TeacherAvailabilityCalculator`**: A static object containing complex logic for calculating teacher availability, including synchronous scheduling.
- **`LessonPreparation`**: A static object for preparing lesson data for API calls.
- **`useWhiteboardBackend` hook**: This is the central orchestrator, performing data extraction, sorting, mapping, and filtering based on selected dates. It encapsulates significant business logic.

## Analysis and Proposed Abstractions

To enhance modularity and adhere to Single Responsibility Principle (SRP), the following class abstractions are proposed:

### 1. `BookingDataProcessor` (Existing - Well-structured)

- **Purpose:** To encapsulate the transformation of raw Drizzle booking data into a processed, frontend-friendly `ProcessedBookingData` structure.
- **Key Responsibilities:** Extracting package details, calculating price per hour, simplifying student and lesson structures, and determining booking completion status and progress.
- **Optimization Rationale:** This class is already well-designed and adheres to SRP. No significant changes are recommended for its internal structure.

### 2. `TimeUtils` (Existing - Well-structured)Ok as u can see somethings were lef5t off. lets create a new file  MY_Inpteretation.md  and we are going to talk about the class, and how the backend will work for the front end.

We want, the constructor to take in bookings and teachers.  and date.  we are then going to create today_kite_event. based of teachers in linked list format.  then. I want the yes, modify time, start time. Create all avaiable lesson. view all aia/ale lesson  the calculateions and export functions form absModekls.md  try again. Keep it simple and focus on the important before we iterate

- **Purpose:** To provide a set of static, pure utility functions for common time-related calculations.
- **Key Responsibilities:** Generating time options, calculating end times based on duration, and adjusting times.
- **Optimization Rationale:** As a collection of pure functions, a static utility object is an appropriate design. No changes recommended.

### 3. `TeacherAvailabilityService` (Refactor from `TeacherAvailabilityCalculator`)

- **Purpose:** To manage the complex logic involved in determining and calculating teacher availability, especially concerning synchronous scheduling and conflict resolution.
- **Key Responsibilities:** Grouping lessons by teacher, tracking calculated events, and ensuring sequential scheduling for a single teacher while allowing parallel scheduling across different teachers.
- **Optimization Rationale:** While currently a static object, formalizing it as a `Service` class (even if its methods remain static) clearly communicates its role in handling a specific, complex business domain. If state management or dependency injection were ever needed for availability rules, this would naturally evolve into an instantiable class.

### 4. `LessonPreparationService` (Refactor from `LessonPreparation`)

- **Purpose:** To handle the final preparation and formatting of lesson data before it's used for external interactions (e.g., API submissions).
- **Key Responsibilities:** Mapping processed lesson data and teacher availability into a format suitable for API consumption.
- **Optimization Rationale:** Similar to `TimeUtils`, this can remain a static utility class/object. Naming it as a `Service` aligns with the pattern of encapsulating specific domain logic.

### 5. `WhiteboardDataManager` (New - Abstracting `useWhiteboardBackend` core logic)

- **Purpose:** This will be the central class responsible for orchestrating all data processing, mapping, and filtering specifically for the whiteboard display. It will abstract away the bulk of the logic currently residing within the `useWhiteboardBackend` hook's `useMemo` block.
- **Key Responsibilities:**
  - Receiving raw data (teachers, bookings).
  - Processing raw bookings using `BookingDataProcessor`.
  - Creating and managing the `teacher-student` mapping.
  - Filtering and preparing `teacherLessonEvents`.
  - Providing a method to retrieve date-specific data (`getDateData`).
  - Handling sorting of bookings.
- **Proposed Structure:**

  ```typescript
  class WhiteboardDataManager {
    private teachers: any[];
    private rawBookings: DrizzleData<BookingType>[];
    private processedBookings: ProcessedBookingData[];
    private teacherStudentMapping: Map<string, TeacherStudentMapping>;
    private allLessons: any[];

    constructor(teachers: any[], rawBookings: DrizzleData<BookingType>[]) {
      this.teachers = teachers;
      this.rawBookings = rawBookings;
      this.allLessons = this.extractAllLessons(rawBookings);
      this.processedBookings = BookingDataProcessor.processBookings(
        this.sortBookings(rawBookings),
      );
      this.teacherStudentMapping = this.createTeacherStudentMapping();
    }

    private extractAllLessons(bookings: DrizzleData<BookingType>[]): any[] {
      const lessons: any[] = [];
      bookings.forEach((booking) => {
        const relations = booking.relations as any;
        if (relations?.lessons) {
          relations.lessons.forEach((lesson: any) => {
            lessons.push({
              ...lesson,
              booking_id: booking.model.id,
            });
          });
        }
      });
      return lessons;
    }

    private sortBookings(
      bookings: DrizzleData<BookingType>[],
    ): DrizzleData<BookingType>[] {
      // Logic for sorting bookings (completed first, then by date_start)
      // This logic would be moved here from useWhiteboardBackend
      return bookings.sort(/* ... sorting logic ... */);
    }

    private createTeacherStudentMapping(): Map<string, TeacherStudentMapping> {
      // Logic for creating teacher-student mapping
      // This logic would be moved here from useWhiteboardBackend
      const mapping = new Map<string, TeacherStudentMapping>();
      this.teachers.forEach((teacher) => {
        mapping.set(teacher.model.id, { teacher, students: [], lessons: [] });
      });
      this.allLessons.forEach((lesson) => {
        const teacherId = lesson.teacher_id;
        if (teacherId && mapping.has(teacherId)) {
          const teacherEntry = mapping.get(teacherId)!;
          teacherEntry.lessons.push(lesson);
          const booking = this.rawBookings.find(
            (b) => b.model.id === lesson.booking_id,
          );
          if (booking) {
            const relations = booking.relations as any;
            if (relations?.bookingStudents) {
              const bookingStudents = relations.bookingStudents;
              bookingStudents.forEach((bookingStudent: any) => {
                if (bookingStudent.student) {
                  const studentExists = teacherEntry.students.find(
                    (s) => s.id === bookingStudent.student.id,
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
      return mapping;
    }

    public getTeacherLessonEvents(): TeacherLessonEvent[] {
      // Logic for filtering and mapping teacher lesson events
      // This logic would be moved here from useWhiteboardBackend
      return Array.from(this.teacherStudentMapping.values())
        .filter((mapping) => mapping.students.length > 0)
        .map((mapping) => ({
          teacher: mapping.teacher,
          lessons: mapping.lessons,
          students: mapping.students,
          totalLessonCount: mapping.lessons.length,
          hasStudents: mapping.students.length > 0,
        }));
    }

    public getDateSpecificData(selectedDate: Date): any {
      // Logic for filtering bookings, teacher lessons, and processing kite events for a specific date
      // This entire nested function from useWhiteboardBackend would be moved here.
      const selectedDateBookings =
        this.processedBookings.filter(/* ... date filtering ... */);
      const selectedDateBookingIds = new Set(
        selectedDateBookings.map((pb) => pb.booking.model.id),
      );

      const todayTeacherLessonsEvent = this.getTeacherLessonEvents()
        .map((teacherEvent) => ({
          ...teacherEvent,
          lessons: teacherEvent.lessons.filter((lesson) =>
            selectedDateBookingIds.has(lesson.booking_id),
          ),
          students: teacherEvent.students.filter((student) => {
            return teacherEvent.lessons.some((lesson) => {
              if (!selectedDateBookingIds.has(lesson.booking_id)) return false;
              const booking = this.rawBookings.find(
                (b) => b.model.id === lesson.booking_id,
              );
              if (!booking) return false;
              const relations = booking.relations as any;
              const bookingStudents = relations?.bookingStudents || [];
              return bookingStudents.some(
                (bs) => bs.student?.id === student.id,
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

      const totalEvents: KiteEventData[] = [];
      todayTeacherLessonsEvent.forEach((teacherEvent) => {
        teacherEvent.lessons.forEach((lesson) => {
          const kiteEvents = lesson.kiteEvents || [];
          const booking = this.rawBookings.find(
            (b) => b.model.id === lesson.booking_id,
          );
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
                const processedBooking = selectedDateBookings.find(
                  (pb) => pb.booking.model.id === lesson.booking_id,
                );
                if (
                  !kiteEvent.id ||
                  !lesson.id ||
                  !teacherEvent.teacher.model.id ||
                  !kiteEvent.location ||
                  !kiteEvent.status
                ) {
                  console.error("❌ Missing required fields for kite event:", {
                    eventId: kiteEvent.id,
                    lessonId: lesson.id,
                    teacherId: teacherEvent.teacher.model.id,
                    location: kiteEvent.location,
                    status: kiteEvent.status,
                  });
                  return;
                }
                totalEvents.push({
                  id: kiteEvent.id,
                  lesson_id: lesson.id,
                  date: kiteEvent.date,
                  time: eventDate.toTimeString().slice(0, 5),
                  duration: duration,
                  location: kiteEvent.location,
                  status: kiteEvent.status,
                  teacher: {
                    id: teacherEvent.teacher.model.id,
                    name: teacherEvent.teacher.model.name,
                  },
                  students: students,
                  pricePerHour: processedBooking?.pricePerHour,
                });
              }
            }
          });
        });
      });

      const sortedEvents = totalEvents.sort((a, b) =>
        a.time.localeCompare(b.time),
      );
      const teacherConfirmationEvents = sortedEvents.filter(
        (event) => event.status === "teacherConfirmation",
      );

      const availableLessonsFromBookings = selectedDateBookings
        .filter((processedBooking) => {
          const packageDuration = processedBooking.packageDuration;
          const totalKiteTime = processedBooking.totalKiteTime;
          const hoursRemaining = Math.max(
            0,
            (packageDuration - totalKiteTime) / 60,
          );
          return hoursRemaining > 0;
        })
        .flatMap((processedBooking) => {
          const booking = processedBooking.booking;
          const relations = booking.relations as any;
          const bookingStudents = relations?.bookingStudents || [];
          const lessons = processedBooking.lessons;

          if (!lessons || lessons.length === 0) return [];

          const allBookingStudents = bookingStudents
            .filter((bs: any) => bs.student)
            .map((bs: any) => bs.student);

          return lessons
            .filter(
              (lesson) =>
                lesson.status === "planned" || lesson.status === "ongoing",
            )
            .map((lesson) => {
              let lessonKiteEventsCount = 0;
              let lessonKiteHoursCompleted = 0;

              lesson.kiteEvents.forEach((kiteEvent: any) => {
                lessonKiteEventsCount++;
                lessonKiteHoursCompleted += kiteEvent.duration / 60;
              });

              const teacher = this.teachers.find(
                (t) => t.model.name === lesson.teacherName,
              );
              if (!teacher) {
                console.error(`❌ Teacher not found for lesson ${lesson.id}:`, {
                  lessonTeacherName: lesson.teacherName,
                  availableTeachers: this.teachers.map((t) => t.model.name),
                });
                return null;
              }

              return {
                lesson_id: lesson.id,
                booking_id: booking.model.id,
                students: allBookingStudents.map((student: any) => ({
                  id: student.id,
                  name: student.name,
                })),
                hours_remaining: Math.max(
                  0,
                  (processedBooking.packageDuration -
                    processedBooking.totalKiteTime) /
                    60,
                ),
                kite_events_count: lessonKiteEventsCount,
                kite_hours_completed: lessonKiteHoursCompleted,
                teacher: { id: teacher.model.id, name: teacher.model.name },
                status: lesson.status,
                pph: processedBooking.pricePerHour,
              };
            })
            .filter(
              (lesson): lesson is NonNullable<typeof lesson> => lesson !== null,
            );
        });

      return {
        todayTeacherLessonsEvent,
        totalEvents: sortedEvents,
        teacherConfirmationEvents,
        availableLessonsFromBookings,
      };
    }
  }
  ```

- **Optimization Rationale:** This abstraction significantly cleans up the `useWhiteboardBackend` hook, making it primarily responsible for fetching the initial data and instantiating `WhiteboardDataManager`. All the complex data manipulation and filtering logic is moved into the class, improving testability, reusability, and readability.

## Overall Benefits of Abstraction

- **Improved Readability:** Each class has a clear, focused responsibility, making the codebase easier to understand.
- **Enhanced Testability:** Individual classes can be tested in isolation, simplifying unit testing.
- **Increased Reusability:** Logic encapsulated within classes can be easily reused across different parts of the application or in other contexts.
- **Better Maintainability:** Changes or bug fixes related to a specific domain (e.g., teacher availability) can be localized to its dedicated class, reducing the risk of introducing regressions elsewhere.
- **Clearer Separation of Concerns:** Business logic is separated from React-specific concerns, making the React components leaner and more focused on UI rendering.
