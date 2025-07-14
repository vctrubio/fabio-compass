/*

// Teacher availability calculation
export const TeacherAvailabilityCalculator = {
    calculateSynchronousAvailability: (
      selectedLessons: LessonWithStudents[],
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
          if (!acc[lesson.teacher.id]) {
            acc[lesson.teacher.id] = [];
          }
          acc[lesson.teacher.id].push(lesson);
          return acc;
        },
        {} as Record<string, LessonWithStudents[]>
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
            lesson.students.length > 1
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
                `📅 Sequential scheduling: Lesson ${lesson.lesson_id.slice(-4)} starts at ${currentTime} (after previous lesson from same teacher)`
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
            lessonId: lesson.lesson_id,
            startTime: calculatedTime,
            endTime,
            duration: lessonDuration,
          });
  
          // Store availability info
          newAvailability[lesson.lesson_id] = {
            ...availability,
            calculatedTime,
            endTime,
            synchronousIndex: index,
            teacherLessonCount: teacherLessons.length,
          };
  
          console.log(
            `🔄 Synchronous calculation for lesson ${lesson.lesson_id.slice(-4)}:`,
            {
              teacherId,
              teacherName: lesson.teacher.name,
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
      selectedLessons: LessonWithStudents[],
      teacherAvailability: Record<string, TeacherAvailability>,
      submitTime: string,
      durations: DurationSettings
    ) => {
      return selectedLessons.map((lesson) => {
        const calculatedTime =
          teacherAvailability[lesson.lesson_id]?.calculatedTime || submitTime;
        const lessonDuration =
          lesson.students.length > 1 ? durations.multiple : durations.single;
        return {
          lessonId: lesson.lesson_id,
          teacherId: lesson.teacher.id,
          calculatedTime: calculatedTime,
          duration: lessonDuration,
        };
      });
    },
  };


  */