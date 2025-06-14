'use client';

import { PushbackEvents } from './pushback-events';
import { LessonForScheduling, DurationSettings } from './types';

interface EventControllerActionsProps {
    selectedLessons: LessonForScheduling[];
    onClearAll: () => void;
    onCreateEvents: () => void;
    isLoading: boolean;
    teacherEventLinkedList?: any;
    durations: DurationSettings;
    location: string;
    selectedDate: Date;
}

export const EventControllerActions = ({
    selectedLessons,
    onClearAll,
    onCreateEvents,
    isLoading,
    teacherEventLinkedList,
    durations,
    location,
    selectedDate
}: EventControllerActionsProps) => {
    return (
        <div className="flex justify-end gap-2 mt-4">
            <PushbackEvents
                teacherEventLinkedList={teacherEventLinkedList}
                durations={durations}
                location={location}
                selectedDate={selectedDate}
            />
            
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