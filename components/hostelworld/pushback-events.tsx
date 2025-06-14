'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SelectedLessonsDisplay } from './selected-lessons-display';
import { TimeUtils } from '@/lib/utils';
import { LessonForScheduling, DurationSettings, TeacherAvailability } from './types';

interface PushbackEventsProps {
    teacherEventLinkedList: any;
    durations: DurationSettings;
    location: string;
    selectedDate: Date;
}

export const PushbackEvents = ({
    teacherEventLinkedList,
    durations,
    location,
    selectedDate
}: PushbackEventsProps) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [pushbackTime, setPushbackTime] = useState('');
    const [allKiteEventsWithNewTimes, setAllKiteEventsWithNewTimes] = useState<LessonForScheduling[]>([]);
    const [kiteEventAvailability, setKiteEventAvailability] = useState<Record<string, TeacherAvailability>>({});

    const convertAllKiteEventsToLessons = (): LessonForScheduling[] => {
        if (!teacherEventLinkedList) return [];

        const kiteEventLessons: LessonForScheduling[] = [];
        
        teacherEventLinkedList.getTeachers().forEach((teacherNode: any) => {
            let current = teacherNode.eventHead;
            while (current) {
                const event = current.event;
                
                kiteEventLessons.push({
                    lessonId: event.id,
                    studentNames: event.students?.map((s: any) => s.name) || [],
                    teacherName: teacherNode.teacher.teacher.model.name,
                    teacherId: teacherNode.teacher.teacher.model.id,
                });
                
                current = current.next;
            }
        });

        return kiteEventLessons;
    };

    const calculateKiteEventAvailability = (kiteEventLessons: LessonForScheduling[]) => {
        if (!teacherEventLinkedList) return;

        const calculatedAvailability: Record<string, TeacherAvailability> = {};

        // Group by teacher
        const lessonsByTeacher = kiteEventLessons.reduce((acc, lesson) => {
            if (!acc[lesson.teacherId]) {
                acc[lesson.teacherId] = [];
            }
            acc[lesson.teacherId].push(lesson);
            return acc;
        }, {} as Record<string, LessonForScheduling[]>);

        // Process each teacher's kite events
        Object.entries(lessonsByTeacher).forEach(([teacherId, teacherLessons]) => {
            let currentTime = pushbackTime;

            teacherLessons.forEach((lesson, index) => {
                let calculatedTime: string;

                if (index === 0) {
                    calculatedTime = pushbackTime;
                } else {
                    calculatedTime = currentTime;
                }

                // Determine duration based on student count
                const lessonDuration = lesson.studentNames.length > 1 ? durations.multiple : durations.single;
                const endTime = TimeUtils.calculateEndTime(calculatedTime, lessonDuration);

                calculatedAvailability[lesson.lessonId] = {
                    calculatedTime,
                    endTime,
                    conflicts: [],
                    synchronousIndex: index,
                    teacherLessonCount: teacherLessons.length,
                };

                currentTime = endTime;
            });
        });

        setKiteEventAvailability(calculatedAvailability);
    };

    const handleUpdate = () => {
        if (!pushbackTime) {
            toast.error("Please select a time");
            return;
        }

        const kiteEventsAsLessons = convertAllKiteEventsToLessons();
        setAllKiteEventsWithNewTimes(kiteEventsAsLessons);
        calculateKiteEventAvailability(kiteEventsAsLessons);
    };

    const handleConfirm = () => {
        // TODO: Implement the update action for kite events
        toast.success(`Updated ${allKiteEventsWithNewTimes.length} kite events`);
        setAllKiteEventsWithNewTimes([]);
        setKiteEventAvailability({});
        setShowDropdown(false);
    };

    const handleCancel = () => {
        setAllKiteEventsWithNewTimes([]);
        setKiteEventAvailability({});
        setShowDropdown(false);
    };

    const handleRemoveLesson = (lessonId: string) => {
        setAllKiteEventsWithNewTimes(prev => prev.filter(l => l.lessonId !== lessonId));
        setKiteEventAvailability(prev => {
            const newAvail = { ...prev };
            delete newAvail[lessonId];
            return newAvail;
        });
    };

    return (
        <>
            {/* Pushback Events Dropdown */}
            {teacherEventLinkedList && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                    >
                        Pushback Events
                    </button>
                    
                    {showDropdown && (
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
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowDropdown(false)}
                                        className="flex-1 px-3 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
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
                        onRemoveLesson={handleRemoveLesson}
                    />
                    
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Cancel Pushback
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                        >
                            Confirm Pushback ({allKiteEventsWithNewTimes.length})
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};