'use client';

import { useMemo } from 'react';
import { SelectedLessonsDisplayProps } from './types';

export const SelectedLessonsDisplay = ({
    selectedLessons,
    teacherAvailability,
    selectedDate,
    location,
    durations,
    onRemoveLesson
}: SelectedLessonsDisplayProps) => {
    const lessonsByTeacher = useMemo(() => {
        return selectedLessons.reduce((acc, lesson) => {
            if (!acc[lesson.teacher.id]) {
                acc[lesson.teacher.id] = {
                    teacherName: lesson.teacher.name,
                    lessons: []
                };
            }
            acc[lesson.teacher.id].lessons.push(lesson);
            return acc;
        }, {} as Record<string, { teacherName: string; lessons: any[] }>);
    }, [selectedLessons]);

    return (
        <div className="mt-4">
            <h4 className="text-sm font-medium mb-3">Selected Lessons by Teacher:</h4>
            <div className="flex flex-wrap gap-4 max-h-[300px] overflow-y-auto">
                {Object.entries(lessonsByTeacher).map(([teacherId, { teacherName, lessons }]) => (
                    <div key={teacherId} className="flex-1 min-w-[300px] border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Adding {lessons.length} event{lessons.length !== 1 ? 's' : ''} to teacher: <span className="text-blue-600 dark:text-blue-400">{teacherName}</span>
                            </h5>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {teacherId.slice(-6)}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {lessons.map((lesson, index) => {
                                const availability = teacherAvailability[lesson.lesson_id];
                                const calculatedTime = availability?.calculatedTime;
                                const endTime = availability?.endTime;
                                const hasConflicts = availability?.conflicts && availability.conflicts.length > 0;
                                const duration = lesson.students.length > 1 ? durations.multiple : durations.single;

                                return (
                                    <div
                                        key={lesson.lesson_id}
                                        className={`p-2 rounded border ${hasConflicts
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 items-center">
                                                <div className="text-sm text-gray-600 dark:text-gray-300 space-x-4 flex">
                                                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">
                                                        #{index + 1}
                                                    </span>
                                                    <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">
                                                        {lesson.lesson_id.slice(-4)}
                                                    </span>
                                                    {hasConflicts && (
                                                        <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded">
                                                            ⚠️
                                                        </span>
                                                    )}
                                                    <div><strong>Students:</strong> {lesson.students.map(s => s.name).join(', ')}</div>
                                                    <div><strong>Location:</strong> {location}</div>
                                                    <div><strong>Duration:</strong> {duration / 60}h</div>
                                                    <div>
                                                        <strong>Time:</strong> {calculatedTime}{endTime && ` - ${endTime}`}
                                                    </div>
                                                    <div><strong>Date:</strong> {selectedDate.toLocaleDateString()}</div>
                                                </div>

                                                {hasConflicts && (
                                                    <div className="text-xs text-red-600 dark:text-red-400 mt-1 p-1 bg-red-50 dark:bg-red-900/10 rounded">
                                                        Conflicts: {availability.conflicts.map((c: any) => {
                                                            const conflictType = c.type || 'event';
                                                            const conflictTime = c.time ? ` at ${c.time}` : '';
                                                            return `${conflictType}${conflictTime}`;
                                                        }).join(', ')}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => onRemoveLesson(lesson.lesson_id)}
                                                className="ml-2 text-red-500 hover:text-red-700 px-1 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};