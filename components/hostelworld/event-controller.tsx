"use client";

import React, { useState, useEffect } from "react";
import UpdateKiteEventsDisplay from "./event-updates";
import {
    TimeControl,
    LocationControl,
    DurationControl,
} from "./event-setting-controller";
import {
    createKiteEventsWithCalculatedTimeAction,
} from "@/actions/kite-actions";
import { TimeUtils } from "@/lib/utils";
import {
    EventControllerProps,
    DurationSettings,
    TeacherAvailability,
    KiteEventData,
    LessonWithStudents,
} from "./types";
import { EventSubmission } from "./event-submission";

export function EventController({
    selectedLessons,
    selectedDate,
    onRemoveLesson,
    onClearAll,
    teacherEventLinkedList,
    earliestTime,
    todayKiteEvents,
}: EventControllerProps) {
    // State management
    const [submitTime, setSubmitTime] = useState(earliestTime);
    const [durations, setDurations] = useState<DurationSettings>({
        single: 120,
        multiple: 180,
    });
    const [location, setLocation] = useState<"Los Lances" | "Valdevaqueros">(
        "Los Lances",
    );
    const [isLoading, setIsLoading] = useState(false);
    const [teacherAvailability, setTeacherAvailability] = useState<
        Record<string, TeacherAvailability>
    >({});
    const [showPushbackEvents, setShowPushbackEvents] = useState(false);

    // --- GAP STATE ---
    // Store gaps for each lesson (in minutes)
    const [gaps, setGaps] = useState<Record<string, number>>({});

    // Duration options
    const singleDurationOptions = [
        { value: 60, label: "1h" },
        { value: 120, label: "2h" },
        { value: 180, label: "3h" },
    ];

    const multipleDurationOptions = [
        { value: 120, label: "2h" },
        { value: 180, label: "3h" },
        { value: 240, label: "4h" },
    ];

    // Calculate next available submit time
    const calcSubmitTime = React.useCallback((currentTime: string, teacherId: string): string => {
        if (!teacherEventLinkedList) return currentTime;

        const teacherNode = teacherEventLinkedList.getTeacherById(teacherId);
        if (!teacherNode || !teacherNode.hasEvents()) return currentTime;

        const teacherEvents = teacherNode.getAllEvents();
        if (!teacherEvents || teacherEvents.length === 0) return currentTime;

        const sortedEvents = [...teacherEvents].sort((a, b) =>
            a.time.localeCompare(b.time),
        );

        for (let i = 0; i < sortedEvents.length; i++) {
            const event = sortedEvents[i];
            const nextEvent = sortedEvents[i + 1];

            if (currentTime < event.time) {
                return currentTime;
            }

            if (!nextEvent) {
                return TimeUtils.calculateEndTime(event.time, event.duration || 60);
            }

            const currentEndTime = TimeUtils.calculateEndTime(
                event.time,
                event.duration || 60,
            );
            if (currentEndTime < nextEvent.time) {
                return currentEndTime;
            }
        }

        const lastEvent = sortedEvents[sortedEvents.length - 1];
        return TimeUtils.calculateEndTime(lastEvent.time, lastEvent.duration || 60);
    }, [teacherEventLinkedList]);

    // Update submit time when selected lessons change
    useEffect(() => {
        if (selectedLessons.length > 0 && teacherEventLinkedList) {
            const lessonsByTeacher = selectedLessons.reduce(
                (acc, lesson) => {
                    if (!acc[lesson.teacher.id]) {
                        acc[lesson.teacher.id] = [];
                    }
                    acc[lesson.teacher.id].push(lesson);
                    return acc;
                },
                {} as Record<string, any[]>,
            );

            Object.entries(lessonsByTeacher).forEach(([teacherId, lessons]) => {
                const nextTime = calcSubmitTime(submitTime, teacherId);
                if (nextTime !== submitTime) {
                    setSubmitTime(nextTime);
                }
            });
        }
    }, [selectedLessons, teacherEventLinkedList, calcSubmitTime, submitTime]);

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

            const lessonsByTeacher = selectedLessons.reduce(
                (acc, lesson) => {
                    if (!acc[lesson.teacher.id]) {
                        acc[lesson.teacher.id] = [];
                    }
                    acc[lesson.teacher.id].push(lesson);
                    return acc;
                },
                {} as Record<string, any[]>,
            );

            Object.entries(lessonsByTeacher).forEach(
                ([teacherId, teacherLessons]) => {
                    let currentTime = submitTime;

                    teacherLessons.forEach((lesson, index) => {
                        const lessonDuration =
                            lesson.students.length > 1
                                ? durations.multiple
                                : durations.single;

                        let calculatedTime: string;
                        let conflicts: any[] = [];

                        if (index === 0) {
                            const availability =
                                teacherEventLinkedList.getTeacherLessonAvailability(
                                    teacherId,
                                    submitTime,
                                );
                            calculatedTime = availability.calculatedTime;
                            conflicts = availability.conflicts || [];
                            currentTime = calculatedTime;
                        } else {
                            calculatedTime = currentTime;
                            conflicts = [];
                        }

                        const endTime = TimeUtils.calculateEndTime(
                            calculatedTime,
                            lessonDuration,
                        );

                        calculatedAvailability[lesson.lesson_id] = {
                            calculatedTime,
                            endTime,
                            conflicts,
                            synchronousIndex: index,
                            teacherLessonCount: teacherLessons.length,
                        };

                        currentTime = endTime;
                    });
                },
            );

            setTeacherAvailability(calculatedAvailability);
        }
    }, [selectedLessons, teacherEventLinkedList, durations, submitTime]);

    const createEventsWithCalculatedTime = async () => {
        setIsLoading(true);
        try {
            // Group lessons by teacher for gap calculation
            const lessonsByTeacher: Record<string, LessonWithStudents[]> = {};
            selectedLessons.forEach(lesson => {
                if (!lessonsByTeacher[lesson.teacher.id]) lessonsByTeacher[lesson.teacher.id] = [];
                lessonsByTeacher[lesson.teacher.id].push(lesson);
            });

            // For each teacher, calculate gap-adjusted start times
            const lessonsWithCalculatedTime = selectedLessons.map(lesson => {
                const teacherLessons = lessonsByTeacher[lesson.teacher.id];
                const index = teacherLessons.findIndex(l => l.lesson_id === lesson.lesson_id);
                const baseTime = teacherAvailability[lesson.lesson_id]?.calculatedTime || submitTime;
                // Sum all previous gaps for this teacher
                let totalGap = 0;
                for (let i = 0; i < index; i++) {
                    const prevLesson = teacherLessons[i];
                    totalGap += gaps[prevLesson.lesson_id] || 0;
                }
                const thisGap = gaps[lesson.lesson_id] || 0;
                const totalGapForThisLesson = totalGap + thisGap;
                // Calculate adjusted start time
                let adjustedTime = baseTime;
                if (baseTime && totalGapForThisLesson > 0) {
                    const [h, m] = baseTime.split(":").map(Number);
                    const totalMinutes = h * 60 + m + totalGapForThisLesson;
                    const newHours = Math.floor(totalMinutes / 60);
                    const newMins = totalMinutes % 60;
                    adjustedTime = `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
                }
                const lessonDuration = lesson.students.length > 1 ? durations.multiple : durations.single;
                return {
                    lessonId: lesson.lesson_id,
                    teacherId: lesson.teacher.id,
                    calculatedTime: adjustedTime,
                    duration: lessonDuration,
                };
            });

            const result = await createKiteEventsWithCalculatedTimeAction({
                lessons: lessonsWithCalculatedTime,
                selectedDate: selectedDate,
                location,
                selectedEquipmentIds: [],
            });

            if (result.success) {
                onClearAll();
            } else {
                throw new Error(result.error || "Failed to create kite events");
            }
        } catch (error: any) {
            console.error("Error creating kite events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="">
            {/* First Row: Event Controller */}
            <div className="mb-6 border rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Event Controller
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <TimeControl submitTime={submitTime} onTimeChange={setSubmitTime} />
                    <DurationControl
                        label="Single"
                        value={durations.single}
                        onChange={(value) =>
                            setDurations((prev) => ({ ...prev, single: value }))
                        }
                        options={singleDurationOptions}
                    />
                    <DurationControl
                        label="Group"
                        value={durations.multiple}
                        onChange={(value) =>
                            setDurations((prev) => ({ ...prev, multiple: value }))
                        }
                        options={multipleDurationOptions}
                    />
                    <LocationControl location={location} onChange={setLocation} />
                </div>
            </div>

            {/* Second Row: Pushback Controller */}
            {todayKiteEvents && todayKiteEvents.length > 0 && (
                <div className="mb-6 border rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        Update Kite Lessons
                        <button
                            type="button"
                            onClick={() => setShowPushbackEvents((prev) => !prev)}
                            className="ml-2 px-3 py-1 rounded-md text-sm font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {showPushbackEvents ? "Hide Events" : `${todayKiteEvents?.length || 0} Events`}
                        </button>
                    </h3>
                    {showPushbackEvents && todayKiteEvents && todayKiteEvents.length > 0 ? (
                        <UpdateKiteEventsDisplay
                            todayKiteEvents={todayKiteEvents}
                            submitTime={submitTime}
                            location={location}
                            durations={durations}
                            selectedDate={selectedDate}
                            onClose={() => setShowPushbackEvents(false)}
                        />
                    ) : (
                        showPushbackEvents && <p className="text-gray-500 dark:text-gray-400">
                            No kite event selected or no events to display.
                        </p>
                    )}
                </div>
            )}

            {/* Third Row: Selected Kite Events */}
            {selectedLessons.length > 0 && (
                <div className="mb-6 border rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Create Kite Lessons
                    </h3>
                    <div className="space-y-4">
                        <EventSubmission
                            selectedLessons={selectedLessons}
                            teacherAvailability={teacherAvailability}
                            location={location}
                            durations={durations}
                            onRemoveLesson={onRemoveLesson}
                            onClearAll={onClearAll}
                            onCreateEvents={createEventsWithCalculatedTime}
                            isLoading={isLoading}
                            gaps={gaps}
                            setGaps={setGaps}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
