import { useMemo } from "react";
import { BookingWithRelations } from "@/rails/types";
import { TeacherLessonDiv } from "./TeacherLessonDiv";

interface AdminTeacherLessonStudentMapProps {
  allBookings: BookingWithRelations[];
  onLessonClick: (lessonId: string) => void;
}

export default function AdminTeacherLessonStudentMap({ allBookings, onLessonClick }: AdminTeacherLessonStudentMapProps) {
  const teacherLessonMap = useMemo(() => {
    const map = new Map<string, { teacherName: string, lessons: any[] }>();

    allBookings.forEach((booking) => {
      booking.relations.lessons?.forEach((lesson) => {
        if (!lesson.teacher_id || !lesson.teacher?.name) {
          return;
        }

        if (!map.has(lesson.teacher_id)) {
          map.set(lesson.teacher_id, {
            teacherName: lesson.teacher.name,
            lessons: [],
          });
        }

        const teacherData = map.get(lesson.teacher_id);
        if (teacherData) {
          const studentsWithHours = (booking.lambdas.students || []).map((student: any) => {
            const totalPackageMinutes = booking.relations.package?.duration || 0;
            
            let usedMinutes = 0;
            booking.relations.lessons?.forEach((lesson: any) => {
              lesson.kiteEvents?.forEach((kiteEvent: any) => {
                usedMinutes += kiteEvent.duration || 0;
              });
            });

            const remainingMinutes = totalPackageMinutes - usedMinutes;
            const hoursRemaining = (remainingMinutes / 60).toFixed(1);
            return {
              id: student.id,
              name: student.name,
              hoursRemaining: `${hoursRemaining}h`,
            };
          });

          teacherData.lessons.push({
            lessonId: lesson.id,
            students: studentsWithHours,
          });
        }
      });
    });

    return Array.from(map.values());
  }, [allBookings]);

  const handleLessonClick = (lessonId: string) => {
    console.log(`Lesson ID clicked: ${lessonId}`);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Teacher Lesson Map</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacherLessonMap.map((teacherData) => (
          <TeacherLessonDiv
            key={teacherData.teacherName}
            teacherName={teacherData.teacherName}
            lessons={teacherData.lessons}
            onLessonClick={onLessonClick}
          />
        ))}
      </div>
    </div>
  );
}