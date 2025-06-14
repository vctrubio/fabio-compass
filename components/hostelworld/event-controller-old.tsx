'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TimeControl, LocationControl, DurationControl } from './event-setting-controller';
import { createKiteEventsWithCalculatedTimeAction } from '@/actions/kite-actions';
import { toast } from 'sonner';
import {
    TeacherAvailabilityCalculator,
    LessonPreparation,
    type LessonForScheduling,
    type DurationSettings,
    type TeacherAvailability,
    type TeacherLessonEvent
} from './whiteboard-backend';
import { TimeUtils } from '@/lib/utils';
import { TeacherEventLinkedList } from './teacher-event-linked-list';

interface EventControllerProps {
    selectedLessons: LessonForScheduling[];
    selectedDate: Date;
    onRemoveLesson: (lessonId: string) => void;
    onClearAll: () => void;
    teacherEventLinkedList?: any;
    earliestTime: string;
    todayKiteEvents?: any[]; // Today's existing kite events for pushback
}

const SelectedLessonsDisplay = ({
    selectedLessons,
    teacherAvailability,
    selectedDate,
    location,
    durations,
    onRemoveLesson
}: {
    selectedLessons: LessonForScheduling[];
    teacherAvailability: Record<string, TeacherAvailability>;
    selectedDate: Date;
    location: string;
    durations: DurationSettings;
    onRemoveLesson: (lessonId: string) => void;
}) => {
    // Group lessons by teacher
    const lessonsByTeacher = useMemo(() => {
        return selectedLessons.reduce((acc, lesson) => {
            if (!acc[lesson.teacherId]) {
                acc[lesson.teacherId] = {
                    teacherName: lesson.teacherName,
                    lessons: []
                };
            }
            acc[lesson.teacherId].lessons.push(lesson);
            return acc;
        }, {} as Record<string, { teacherName: string; lessons: LessonForScheduling[] }>);
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
                                const availability = teacherAvailability[lesson.lessonId];
                                const calculatedTime = availability?.calculatedTime;
                                const endTime = availability?.endTime;
                                const hasConflicts = availability?.conflicts && availability.conflicts.length > 0;
                                const duration = lesson.studentNames.length > 1 ? durations.multiple : durations.single;

                                return (
                                    <div
                                        key={lesson.lessonId}
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
                                                        {lesson.lessonId.slice(-4)}
                                                    </span>
                                                    {hasConflicts && (
                                                        <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded">
                                                            ⚠️
                                                        </span>
                                                    )}
                                                    <div><strong>Students:</strong> {Array.isArray(lesson.studentNames) ? lesson.studentNames.join(', ') : lesson.studentNames}</div>
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
                                                onClick={() => onRemoveLesson(lesson.lessonId)}
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

export function EventController({
    selectedLessons,
    selectedDate,
    onRemoveLesson,
    onClearAll,
    teacherEventLinkedList,
    earliestTime,
    todayKiteEvents = []
}: EventControllerProps) {
    // State management
    const [submitTime, setSubmitTime] = useState(earliestTime);
    const [durations, setDurations] = useState<DurationSettings>({
        single: 120, // Default 2 hours for single capacity
        multiple: 180 // Default 3 hours for group capacity
    });
    const [location, setLocation] = useState<'Los Lances' | 'Valdevaqueros'>('Los Lances');
    const [isLoading, setIsLoading] = useState(false);
    const [teacherAvailability, setTeacherAvailability] = useState<Record<string, TeacherAvailability>>({});
    
    // Pushback functionality state
    const [showPushbackDropdown, setShowPushbackDropdown] = useState(false);
    const [pushbackTime, setPushbackTime] = useState('');
    const [allKiteEventsWithNewTimes, setAllKiteEventsWithNewTimes] = useState<any[]>([]);
    const [kiteEventAvailability, setKiteEventAvailability] = useState<Record<string, TeacherAvailability>>({});

    // Calculate next available submit time
    const calcSubmitTime = (currentTime: string, teacherId: string): string => {
        if (!teacherEventLinkedList) return currentTime;

        // Get teacher node and their events
        const teacherNode = teacherEventLinkedList.getTeacherById(teacherId);
        if (!teacherNode || !teacherNode.hasEvents()) return currentTime;

        // Get all events for this teacher
        const teacherEvents = teacherNode.getAllEvents();
        if (!teacherEvents || teacherEvents.length === 0) return currentTime;

        // Sort events by time
        const sortedEvents = [...teacherEvents].sort((a, b) => a.time.localeCompare(b.time));

        // Find the next available time slot
        for (let i = 0; i < sortedEvents.length; i++) {
            const event = sortedEvents[i];
            const nextEvent = sortedEvents[i + 1];

            // If current time is before this event, we can use current time
            if (currentTime < event.time) {
                return currentTime;
            }

            // If this is the last event, we can use its end time
            if (!nextEvent) {
                return TimeUtils.calculateEndTime(event.time, event.duration || 60);
            }

            // If there's a gap between this event and the next one, we can use this event's end time
            const currentEndTime = TimeUtils.calculateEndTime(event.time, event.duration || 60);
            if (currentEndTime < nextEvent.time) {
                return currentEndTime;
            }
        }

        // If we get here, use the end time of the last event
        const lastEvent = sortedEvents[sortedEvents.length - 1];
        return TimeUtils.calculateEndTime(lastEvent.time, lastEvent.duration || 60);
    };

    // Update submit time when selected lessons change
    useEffect(() => {
        if (selectedLessons.length > 0 && teacherEventLinkedList) {
            // Group lessons by teacher
            const lessonsByTeacher = selectedLessons.reduce((acc, lesson) => {
                if (!acc[lesson.teacherId]) {
                    acc[lesson.teacherId] = [];
                }
                acc[lesson.teacherId].push(lesson);
                return acc;
            }, {} as Record<string, LessonForScheduling[]>);

            // For each teacher, calculate the next available time
            Object.entries(lessonsByTeacher).forEach(([teacherId, lessons]) => {
                const nextTime = calcSubmitTime(submitTime, teacherId);
                if (nextTime !== submitTime) {
                    setSubmitTime(nextTime);
                }
            });
        }
    }, [selectedLessons, teacherEventLinkedList]);

    // Update submit time when earliestTime changes
    useEffect(() => {
        // Check if selected date is today
        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();

        if (isToday) {
            // If it's today and earliest time is before current time, use current time + 1 hour
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            const roundedHour = currentMinutes > 0 ? currentHour + 1 : currentHour;
            const currentTimeRoundedUp = `${roundedHour.toString().padStart(2, '0')}:00`;

            if (earliestTime < currentTimeRoundedUp) {
                setSubmitTime(currentTimeRoundedUp);
            } else {
                setSubmitTime(earliestTime);
            }
        } else {
            setSubmitTime(earliestTime);
        }
    }, [earliestTime, selectedDate]);

    // Duration options
    const singleDurationOptions = [
        { value: 60, label: '1h' },
        { value: 120, label: '2h' },
        { value: 180, label: '3h' }
    ];

    const multipleDurationOptions = [
        { value: 120, label: '2h' },
        { value: 180, label: '3h' },
        { value: 240, label: '4h' }
    ];

    // Calculate teacher availability whenever dependencies change
    useEffect(() => {
        if (teacherEventLinkedList && selectedLessons.length > 0) {
            const calculatedAvailability: Record<string, TeacherAvailability> = {};

            // Group lessons by teacher
            const lessonsByTeacher = selectedLessons.reduce((acc, lesson) => {
                if (!acc[lesson.teacherId]) {
                    acc[lesson.teacherId] = [];
                }
                acc[lesson.teacherId].push(lesson);
                return acc;
            }, {} as Record<string, LessonForScheduling[]>);

            // Process each teacher's lessons
            Object.entries(lessonsByTeacher).forEach(([teacherId, teacherLessons]) => {
                let currentTime = submitTime; // Each teacher starts at submitTime

                teacherLessons.forEach((lesson, index) => {
                    const lessonDuration = lesson.studentNames.length > 1 ? durations.multiple : durations.single;

                    let calculatedTime: string;
                    let conflicts: any[] = [];

                    if (index === 0) {
                        // For the first lesson of each teacher, check availability
                        const availability = teacherEventLinkedList.getTeacherLessonAvailability(teacherId, submitTime);
                        calculatedTime = availability.calculatedTime;
                        conflicts = availability.conflicts || [];
                        currentTime = calculatedTime; // Update currentTime to the calculated time
                    } else {
                        // For subsequent lessons, use the end time of the previous lesson (no conflicts)
                        calculatedTime = currentTime;
                        conflicts = []; // No conflicts since we're scheduling sequentially
                    }

                    const endTime = TimeUtils.calculateEndTime(calculatedTime, lessonDuration);

                    calculatedAvailability[lesson.lessonId] = {
                        calculatedTime,
                        endTime,
                        conflicts,
                        synchronousIndex: index,
                        teacherLessonCount: teacherLessons.length,
                    };

                    // Update currentTime for the next lesson of this teacher
                    currentTime = endTime;
                });
            });

            setTeacherAvailability(calculatedAvailability);
        }
    }, [selectedLessons, teacherEventLinkedList, durations, submitTime]);

    const createEventsWithCalculatedTime = async () => {
        setIsLoading(true);

        try {
            const lessonsWithCalculatedTime = LessonPreparation.prepareLessonsWithCalculatedTime(
                selectedLessons,
                teacherAvailability,
                submitTime,
                durations
            );

            console.log('Creating kite events:', {
                lessons: lessonsWithCalculatedTime,
                selectedDate: selectedDate,
                location,
                selectedEquipmentIds: [] // TODO: Add equipment selection
            });

            const result = await createKiteEventsWithCalculatedTimeAction({
                lessons: lessonsWithCalculatedTime,
                selectedDate: selectedDate,
                location,
                selectedEquipmentIds: []
            });

            if (result.success) {
                console.log('Kite events created successfully!');
                onClearAll();
            } else {
                throw new Error(result.error || 'Failed to create kite events');
            }
        } catch (error: any) {
            console.error('Error creating kite events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePushbackUpdate = () => {
        if (!pushbackTime) {
            toast.error("Please select a time");
            return;
        }

        // Convert ALL kite events from the whiteboard to lessons format
        const kiteEventsAsLessons = convertAllKiteEventsToLessons();
        setAllKiteEventsWithNewTimes(kiteEventsAsLessons);
        
        // Calculate availability for kite events (similar to regular lessons)
        calculateKiteEventAvailability(kiteEventsAsLessons);
    };

    const convertAllKiteEventsToLessons = () => {
        if (!teacherEventLinkedList) return [];

        const kiteEventLessons: any[] = [];
        
        // Get ALL events from the teacher linked list (this is all events on the whiteboard)
        teacherEventLinkedList.getTeachers().forEach((teacherNode: any) => {
            let current = teacherNode.eventHead;
            while (current) {
                const event = current.event;
                
                kiteEventLessons.push({
                    lessonId: event.id,
                    studentNames: event.students?.map((s: any) => s.name) || [],
                    teacherName: teacherNode.teacher.teacher.model.name,
                    teacherId: teacherNode.teacher.teacher.model.id,
                    originalTime: event.time,
                    duration: event.duration || 120,
                });
                
                current = current.next;
            }
        });

        return kiteEventLessons;
    };

    const calculateKiteEventAvailability = (kiteEventLessons: any[]) => {
        if (!teacherEventLinkedList) return;

        const calculatedAvailability: Record<string, TeacherAvailability> = {};

        // Group by teacher
        const lessonsByTeacher = kiteEventLessons.reduce((acc, lesson) => {
            if (!acc[lesson.teacherId]) {
                acc[lesson.teacherId] = [];
            }
            acc[lesson.teacherId].push(lesson);
            return acc;
        }, {} as Record<string, any[]>);

        // Process each teacher's kite events
        Object.entries(lessonsByTeacher).forEach(([teacherId, teacherLessons]) => {
            let currentTime = pushbackTime; // Start from the new pushback time

            teacherLessons.forEach((lesson, index) => {
                let calculatedTime: string;
                let conflicts: any[] = [];

                if (index === 0) {
                    // First event gets the pushback time
                    calculatedTime = pushbackTime;
                } else {
                    // Subsequent events use the end time of the previous event
                    calculatedTime = currentTime;
                }

                // Determine duration based on student count (single vs multiple)
                const lessonDuration = lesson.studentNames.length > 1 ? durations.multiple : durations.single;
                const endTime = TimeUtils.calculateEndTime(calculatedTime, lessonDuration);

                calculatedAvailability[lesson.lessonId] = {
                    calculatedTime,
                    endTime,
                    conflicts,
                    synchronousIndex: index,
                    teacherLessonCount: teacherLessons.length,
                };

                // Update currentTime for next event
                currentTime = endTime;
            });
        });

        setKiteEventAvailability(calculatedAvailability);
    };

    const conflictCount = useMemo(() =>
        Object.values(teacherAvailability).filter(a => a.conflicts && a.conflicts.length > 0).length,
        [teacherAvailability]
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium">
                        {selectedLessons.length > 0
                            ? `${selectedLessons.length} Lessons Selected`
                            : 'No Lessons Selected'}
                    </h3>
                    <div className="flex items-center gap-4">
                        <TimeControl submitTime={submitTime} onTimeChange={setSubmitTime} />

                        <DurationControl
                            label="Single"
                            value={durations.single}
                            onChange={(value) => setDurations(prev => ({ ...prev, single: value }))}
                            options={singleDurationOptions}
                        />

                        <DurationControl
                            label="Group"
                            value={durations.multiple}
                            onChange={(value) => setDurations(prev => ({ ...prev, multiple: value }))}
                            options={multipleDurationOptions}
                        />

                        <LocationControl location={location} onChange={setLocation} />
                    </div>
                </div>
            </div>

            {selectedLessons.length > 0 && (
                <div className="space-y-4">
                    {/* Scheduling Summary */}
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

                    <SelectedLessonsDisplay
                        selectedLessons={selectedLessons}
                        teacherAvailability={teacherAvailability}
                        selectedDate={selectedDate}
                        location={location}
                        durations={durations}
                        onRemoveLesson={onRemoveLesson}
                    />

                    {/* Show Kite Events when pushback is active */}
                    {allKiteEventsWithNewTimes.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-3 text-orange-600 dark:text-orange-400">
                                Pushback Kite Events (New Times):
                            </h4>
                            <SelectedLessonsDisplay
                                selectedLessons={allKiteEventsWithNewTimes}
                                teacherAvailability={kiteEventAvailability}
                                selectedDate={selectedDate}
                                location={location}
                                durations={durations}
                                onRemoveLesson={(lessonId) => {
                                    setAllKiteEventsWithNewTimes(prev => prev.filter(l => l.lessonId !== lessonId));
                                    setKiteEventAvailability(prev => {
                                        const newAvail = { ...prev };
                                        delete newAvail[lessonId];
                                        return newAvail;
                                    });
                                }}
                            />
                            
                            <div className="flex justify-end gap-2 mt-3">
                                <button
                                    onClick={() => {
                                        setAllKiteEventsWithNewTimes([]);
                                        setKiteEventAvailability({});
                                        setShowPushbackDropdown(false);
                                    }}
                                    className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel Pushback
                                </button>
                                <button
                                    onClick={() => {
                                        // TODO: Implement the update action for kite events
                                        toast.success(`Updated ${allKiteEventsWithNewTimes.length} kite events`);
                                        setAllKiteEventsWithNewTimes([]);
                                        setKiteEventAvailability({});
                                        setShowPushbackDropdown(false);
                                    }}
                                    className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                                >
                                    Confirm Pushback ({allKiteEventsWithNewTimes.length})
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        {/* Pushback Events Dropdown */}
                        {todayKiteEvents && todayKiteEvents.length > 0 && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowPushbackDropdown(!showPushbackDropdown)}
                                    className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                                >
                                    Pushback Events ({todayKiteEvents.length})
                                </button>
                                
                                {showPushbackDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 p-4">
                                        <h4 className="font-medium mb-3">Pushback All Events</h4>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">New Start Time</label>
                                                <input
                                                    type="time"
                                                    value={pushbackTime}
                                                    onChange={(e) => setPushbackTime(e.target.value)}
                                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Update Type</label>
                                                <div className="space-y-1">
                                                    <label className="flex items-center text-sm">
                                                        <input
                                                            type="radio"
                                                            value="single"
                                                            checked={pushbackType === 'single'}
                                                            onChange={(e) => setPushbackType(e.target.value as 'single' | 'group')}
                                                            className="mr-2"
                                                        />
                                                        Single - Only first event
                                                    </label>
                                                    <label className="flex items-center text-sm">
                                                        <input
                                                            type="radio"
                                                            value="group"
                                                            checked={pushbackType === 'group'}
                                                            onChange={(e) => setPushbackType(e.target.value as 'single' | 'group')}
                                                            className="mr-2"
                                                        />
                                                        Group - All events
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowPushbackDropdown(false)}
                                                    className="flex-1 px-3 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handlePushbackUpdate}
                                                    disabled={!pushbackTime}
                                                    className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Clear All
                        </button>
                        <button
                            type="button"
                            onClick={createEventsWithCalculatedTime}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : `Create ${selectedLessons.length} Lesson${selectedLessons.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}