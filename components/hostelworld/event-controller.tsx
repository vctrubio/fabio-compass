'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TimeControl, LocationControl, DurationControl } from './event-setting-controller';
import { createKiteEventsWithCalculatedTimeAction } from '@/actions/kite-actions';
import { LessonPreparation } from './whiteboard-backend';
import { TimeUtils } from '@/lib/utils';
import { SelectedLessonsDisplay } from './selected-lessons-display';
import { EventControllerActions } from './event-controller-actions';
import { SchedulingSummary } from './scheduling-summary';
import { 
    EventControllerProps, 
    DurationSettings, 
    TeacherAvailability 
} from './types';

export function EventController({
    selectedLessons,
    selectedDate,
    onRemoveLesson,
    onClearAll,
    teacherEventLinkedList,
    earliestTime
}: EventControllerProps) {
    // State management
    const [submitTime, setSubmitTime] = useState(earliestTime);
    const [durations, setDurations] = useState<DurationSettings>({
        single: 120,
        multiple: 180
    });
    const [location, setLocation] = useState<'Los Lances' | 'Valdevaqueros'>('Los Lances');
    const [isLoading, setIsLoading] = useState(false);
    const [teacherAvailability, setTeacherAvailability] = useState<Record<string, TeacherAvailability>>({});

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

    // Calculate next available submit time
    const calcSubmitTime = (currentTime: string, teacherId: string): string => {
        if (!teacherEventLinkedList) return currentTime;

        const teacherNode = teacherEventLinkedList.getTeacherById(teacherId);
        if (!teacherNode || !teacherNode.hasEvents()) return currentTime;

        const teacherEvents = teacherNode.getAllEvents();
        if (!teacherEvents || teacherEvents.length === 0) return currentTime;

        const sortedEvents = [...teacherEvents].sort((a, b) => a.time.localeCompare(b.time));

        for (let i = 0; i < sortedEvents.length; i++) {
            const event = sortedEvents[i];
            const nextEvent = sortedEvents[i + 1];

            if (currentTime < event.time) {
                return currentTime;
            }

            if (!nextEvent) {
                return TimeUtils.calculateEndTime(event.time, event.duration || 60);
            }

            const currentEndTime = TimeUtils.calculateEndTime(event.time, event.duration || 60);
            if (currentEndTime < nextEvent.time) {
                return currentEndTime;
            }
        }

        const lastEvent = sortedEvents[sortedEvents.length - 1];
        return TimeUtils.calculateEndTime(lastEvent.time, lastEvent.duration || 60);
    };

    // Update submit time when selected lessons change
    useEffect(() => {
        if (selectedLessons.length > 0 && teacherEventLinkedList) {
            const lessonsByTeacher = selectedLessons.reduce((acc, lesson) => {
                if (!acc[lesson.teacherId]) {
                    acc[lesson.teacherId] = [];
                }
                acc[lesson.teacherId].push(lesson);
                return acc;
            }, {} as Record<string, any[]>);

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
        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();

        if (isToday) {
            const currentTimeRoundedUp = TimeUtils.getCurrentTimeRoundedUp();
            if (earliestTime < currentTimeRoundedUp) {
                setSubmitTime(currentTimeRoundedUp);
            } else {
                setSubmitTime(earliestTime);
            }
        } else {
            setSubmitTime(earliestTime);
        }
    }, [earliestTime, selectedDate]);

    // Calculate teacher availability
    useEffect(() => {
        if (teacherEventLinkedList && selectedLessons.length > 0) {
            const calculatedAvailability: Record<string, TeacherAvailability> = {};

            const lessonsByTeacher = selectedLessons.reduce((acc, lesson) => {
                if (!acc[lesson.teacherId]) {
                    acc[lesson.teacherId] = [];
                }
                acc[lesson.teacherId].push(lesson);
                return acc;
            }, {} as Record<string, any[]>);

            Object.entries(lessonsByTeacher).forEach(([teacherId, teacherLessons]) => {
                let currentTime = submitTime;

                teacherLessons.forEach((lesson, index) => {
                    const lessonDuration = lesson.studentNames.length > 1 ? durations.multiple : durations.single;

                    let calculatedTime: string;
                    let conflicts: any[] = [];

                    if (index === 0) {
                        const availability = teacherEventLinkedList.getTeacherLessonAvailability(teacherId, submitTime);
                        calculatedTime = availability.calculatedTime;
                        conflicts = availability.conflicts || [];
                        currentTime = calculatedTime;
                    } else {
                        calculatedTime = currentTime;
                        conflicts = [];
                    }

                    const endTime = TimeUtils.calculateEndTime(calculatedTime, lessonDuration);

                    calculatedAvailability[lesson.lessonId] = {
                        calculatedTime,
                        endTime,
                        conflicts,
                        synchronousIndex: index,
                        teacherLessonCount: teacherLessons.length,
                    };

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

            const result = await createKiteEventsWithCalculatedTimeAction({
                lessons: lessonsWithCalculatedTime,
                selectedDate: selectedDate,
                location,
                selectedEquipmentIds: []
            });

            if (result.success) {
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
                    <SchedulingSummary
                        selectedLessons={selectedLessons}
                        selectedDate={selectedDate}
                        submitTime={submitTime}
                        teacherAvailability={teacherAvailability}
                    />

                    <SelectedLessonsDisplay
                        selectedLessons={selectedLessons}
                        teacherAvailability={teacherAvailability}
                        selectedDate={selectedDate}
                        location={location}
                        durations={durations}
                        onRemoveLesson={onRemoveLesson}
                    />

                    <EventControllerActions
                        selectedLessons={selectedLessons}
                        onClearAll={onClearAll}
                        onCreateEvents={createEventsWithCalculatedTime}
                        isLoading={isLoading}
                        teacherEventLinkedList={teacherEventLinkedList}
                        durations={durations}
                        location={location}
                        selectedDate={selectedDate}
                    />
                </div>
            )}
        </div>
    );
}