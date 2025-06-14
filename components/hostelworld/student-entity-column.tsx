import React from 'react';
import { HeadsetIcon } from '@/assets/svg/HeadsetIcon';
import { HelmetIcon } from '@/assets/svg/HelmetIcon';
import { LessonWithStudents, StudentEntityColumnProps, StudentModel } from './types';

export function StudentEntityColumn({
  lessons = [],
  onEntityClick,
  selectedLessons = []
}: StudentEntityColumnProps) {
  console.log('lessons i see....', lessons);

  const renderStudent = (student: StudentModel) => {
    if (!student) return null;

    return (
      <div
        key={student.id}
        className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-1 mb-1 flex items-center gap-1"
      >
        <HelmetIcon className="w-3 h-3" />
        {student.name}
      </div>
    );
  };

  const renderLesson = (lesson: LessonWithStudents) => {
    const isSelected = selectedLessons.some(l => l.lesson_id === lesson.lesson_id);

    return (
      <div
        key={`${lesson.lesson_id}-abc`}
        onClick={() => onEntityClick?.(lesson.lesson_id)}
        className={`border rounded-lg p-3 space-y-2 cursor-pointer transition-colors ${isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
      >
        {/* Lesson Header with LessonView and Dropdown */}
        <div className="space-y-2">
          {/* Additional lesson info */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300 flex">
              <span className="flex items-center gap-1 mr-1">
                <HeadsetIcon className="w-3 h-3" />
                {lesson.teacher.name}
              </span>
              <span>[-{lesson.status}-]</span>
            </span>
            <span className={`px-2 py-1 rounded-full font-medium text-xs ${lesson.hours_remaining > 0
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
              {lesson.hours_remaining.toFixed(1)}h
            </span>
          </div>
        </div>

        {/* Students in this lesson */}
        <div className="flex flex-wrap">
          {lesson.students.map(student => renderStudent(student))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg px-1 py-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 flex-shrink-0">
        <HelmetIcon className="w-6 h-6" />
        Students
      </h2>
      <div className="overflow-y-auto flex-1">
        {lessons?.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No available students
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map(renderLesson)}
          </div>
        )}
      </div>
    </div>
  );
}