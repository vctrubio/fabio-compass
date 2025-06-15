'use client';

import { LessonWithStudents } from './types';

interface EventControllerActionsProps {
    selectedLessons: LessonWithStudents[];
    onClearAll: () => void;
    onCreateEvents: () => void;
    isLoading: boolean;
}

export const EventControllerActions = ({
    selectedLessons,
    onClearAll,
    onCreateEvents,
    isLoading,

}: EventControllerActionsProps) => {
    return (
        <div className="flex justify-end gap-2 mt-4">
            <button
                type="button"
                onClick={onClearAll}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                Clear All
            </button>
            <button
                type="button"
                onClick={onCreateEvents}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? 'Creating...' : `Create ${selectedLessons.length} Lesson${selectedLessons.length !== 1 ? 's' : ''}`}
            </button>
        </div>
    );
};