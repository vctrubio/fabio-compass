'use client';

import { useMemo } from 'react';
import { LessonForScheduling, TeacherAvailability } from './types';

interface SchedulingSummaryProps {
    selectedLessons: LessonForScheduling[];
    selectedDate: Date;
    submitTime: string;
    teacherAvailability: Record<string, TeacherAvailability>;
}

export const SchedulingSummary = ({
    selectedLessons,
    selectedDate,
    submitTime,
    teacherAvailability
}: SchedulingSummaryProps) => {
    const conflictCount = useMemo(() =>
        Object.values(teacherAvailability).filter(a => a.conflicts && a.conflicts.length > 0).length,
        [teacherAvailability]
    );

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Scheduling Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-blue-700 dark:text-blue-300">Selected Date:</span>
                    <span className="ml-2 font-medium">{selectedDate.toLocaleDateString()}</span>
                </div>
                <div>
                    <span className="text-blue-700 dark:text-blue-300">Submit Time:</span>
                    <span className="ml-2 font-medium">{submitTime}</span>
                </div>
                <div>
                    <span className="text-blue-700 dark:text-blue-300">Total Lessons:</span>
                    <span className="ml-2 font-medium">{selectedLessons.length}</span>
                </div>
                <div>
                    <span className="text-blue-700 dark:text-blue-300">Conflicts:</span>
                    <span className="ml-2 font-medium">{conflictCount}</span>
                </div>
            </div>
        </div>
    );
};