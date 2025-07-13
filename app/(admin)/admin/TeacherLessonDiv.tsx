import React from 'react';
import { HeadsetIcon, HelmetIcon } from '@/assets/svg';

interface StudentInfo {
  id: string;
  name: string;
  hoursRemaining: string;
}

interface LessonInfo {
  lessonId: string;
  students: StudentInfo[];
}

interface TeacherLessonDivProps {
  teacherName: string;
  lessons: LessonInfo[];
  onLessonClick: (lessonId: string) => void;
}

export const TeacherLessonDiv: React.FC<TeacherLessonDivProps> = ({
  teacherName,
  lessons,
  onLessonClick,
}) => {
  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
        <HeadsetIcon className="w-6 h-6 mr-2 text-blue-500" />
        {teacherName}
      </h3>
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.lessonId} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors duration-200"
              onClick={() => onLessonClick(lesson.lessonId)}>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Lesson:</span>
            <ul className="list-disc list-inside ml-4 text-gray-600 dark:text-gray-400">
              {lesson.students.map((student) => (
                <li key={student.id} className="flex items-center">
                  <HelmetIcon className="w-4 h-4 mr-2 text-orange-400" />
                  {student.name} ({student.hoursRemaining})
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};