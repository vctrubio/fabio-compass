'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TimeControl, LocationControl, DurationControl, PushbackControl } from './event-setting-controller';
import { createKiteEventsWithCalculatedTimeAction, updateKiteEventsWithCalculatedTimeAction } from '@/actions/kite-actions';
import { LessonPreparation } from './whiteboard-backend';
import { TimeUtils } from '@/lib/utils';
import { SelectedLessonsDisplay } from './selected-lessons-display';
import { EventControllerActions } from './event-controller-actions';
import { SchedulingSummary } from './scheduling-summary';
import { formatDuration } from '@/components/formatters';
import {
    EventControllerProps,
    DurationSettings,
    TeacherAvailability,
    KiteEventData
} from './types';

// Selected Kite Events Display Component
const SelectedKiteEventsDisplay = ({ 
    todayKiteEvents,
    submitTime,
    location,
    durations,
    selectedDate,
    onClose
}: { 
    todayKiteEvents?: KiteEventData[];
    submitTime: string;
    location: string;
    durations: DurationSettings;
    selectedDate: Date;
    onClose: () => void;
}) => {
    // State for reordered events per teacher
    const [reorderedEvents, setReorderedEvents] = useState<Record<string, KiteEventData[]>>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    // State for gaps before each event (in minutes)
    const [eventGaps, setEventGaps] = useState<Record<string, number>>({});
    // State for target date (initially the selected date)
    const [targetDate, setTargetDate] = useState<Date>(selectedDate);

    // Reset target date when selected date changes
    useEffect(() => {
        setTargetDate(selectedDate);
    }, [selectedDate]);

    // Check if there are any changes made
    const hasChanges = Object.keys(reorderedEvents).length > 0 || Object.keys(eventGaps).some(id => eventGaps[id] > 0);

    // Function to update all events with their new calculated times, durations, and locations
    const updateEventsWithCalculatedTime = async () => {
        if (!todayKiteEvents || todayKiteEvents.length === 0) {
            console.log('No events to update');
            return;
        }

        setIsUpdating(true);
        
        try {
            // Prepare the events data for update
            const eventsToUpdate: Array<{
                kiteEventId: string;
                calculatedTime: string;
                duration: number;
                location: 'Los Lances' | 'Valdevaqueros';
            }> = [];

            // Iterate through each teacher's recalculated events
            Object.entries(recalculatedEventsByTeacher).forEach(([teacherId, teacherData]) => {
                console.log(`👨‍🏫 Processing teacher ${teacherId.slice(-6)} with ${teacherData.events.length} events:`);
                
                teacherData.events.forEach((event, index) => {
                    // Get original event to compare
                    const originalEvent = todayKiteEvents?.find(e => e.id === event.id);
                    const originalTime = originalEvent ? new Date(originalEvent.date).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Europe/Madrid'
                    }) : 'Unknown';
                    
                    // Log gap information for this event
                    const eventGap = eventGaps[event.id] || 0;
                    console.log(`  � Event #${index + 1} (${event.id.slice(-4)}): ${originalTime} → ${event.newTime}${eventGap > 0 ? ` (gap: +${Math.floor(eventGap / 60)}h${eventGap % 60 > 0 ? ` ${eventGap % 60}m` : ''})` : ''}`);
                    
                    eventsToUpdate.push({
                        kiteEventId: event.id,
                        calculatedTime: event.newTime,
                        duration: event.newDuration,
                        location: event.newLocation
                    });
                });
            });

            // Log summary of gaps being applied
            const totalGaps = Object.values(eventGaps).reduce((sum, gap) => sum + gap, 0);
            if (totalGaps > 0) {
                const gapsCount = Object.keys(eventGaps).filter(id => eventGaps[id] > 0).length;
                console.log(`🕐 Total gaps applied: ${gapsCount} gap${gapsCount !== 1 ? 's' : ''} adding ${Math.floor(totalGaps / 60)}h ${totalGaps % 60}m`);
            }

            console.log(`🔄 Updating ${eventsToUpdate.length} events with new times and details`);

            const result = await updateKiteEventsWithCalculatedTimeAction({
                events: eventsToUpdate,
                selectedDate: targetDate
            });

            if (result.success) {
                console.log('✅ All events updated successfully');
                // Reset reordered events state since changes are now saved
                setReorderedEvents({});
                // Reset gaps since changes are now saved
                setEventGaps({});
                setUpdateSuccess(true);
                // Clear success message after 3 seconds
                setTimeout(() => setUpdateSuccess(false), 3000);
                // Close the dropdown/events display
                onClose();
                // Optionally, you could trigger a refresh of the data here
            } else {
                throw new Error(result.error || 'Failed to update events');
            }
        } catch (error: any) {
            console.error('Error updating kite events:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const eventsByTeacher = useMemo(() => {
        if (!todayKiteEvents) return {};
        
        return todayKiteEvents.reduce((acc, event) => {
            if (!acc[event.teacher.id]) {
                acc[event.teacher.id] = {
                    teacherName: event.teacher.name,
                    events: []
                };
            }
            acc[event.teacher.id].events.push(event);
            return acc;
        }, {} as Record<string, { teacherName: string; events: KiteEventData[] }>);
    }, [todayKiteEvents]);

    // Function to move an event up or down in the list
    const moveEvent = (teacherId: string, eventIndex: number, direction: 'up' | 'down') => {
        const currentEvents = reorderedEvents[teacherId] || eventsByTeacher[teacherId]?.events || [];
        const newEvents = [...currentEvents];
        
        const targetIndex = direction === 'up' ? eventIndex - 1 : eventIndex + 1;
        
        if (targetIndex >= 0 && targetIndex < newEvents.length) {
            // Swap the events
            [newEvents[eventIndex], newEvents[targetIndex]] = [newEvents[targetIndex], newEvents[eventIndex]];
            
            setReorderedEvents(prev => ({
                ...prev,
                [teacherId]: newEvents
            }));
        }
    };

    // Function to add/remove gap time before an event
    const adjustEventGap = (eventId: string, change: number) => {
        setEventGaps(prev => {
            const currentGap = prev[eventId] || 0;
            const newGap = Math.max(0, currentGap + change); // Minimum 0 minutes
            return {
                ...prev,
                [eventId]: newGap
            };
        });
    };

    // Calculate new times for each teacher's events based on submit time
    const recalculatedEventsByTeacher = useMemo(() => {
        if (!todayKiteEvents) return {};

        const recalculated: Record<string, { teacherName: string; events: any[] }> = {};

        Object.entries(eventsByTeacher).forEach(([teacherId, teacherData]) => {
            const { teacherName } = teacherData;
            
            // Use reordered events if available, otherwise use original order
            const eventsToCalculate = reorderedEvents[teacherId] || teacherData.events;

            // Track the current end time for this teacher (starts with submit time)
            let currentEndTime = submitTime;

            const recalculatedEvents = eventsToCalculate.map((event, index) => {
                // Use the same duration logic as lesson creation
                const newDuration = event.students.length > 1 ? durations.multiple : durations.single;
                
                let calculatedTime: string;

                // Get gap for this event
                const gapMinutes = eventGaps[event.id] || 0;

                if (index === 0) {
                    // For first event, start at submit time plus any gap
                    const [hours, minutes] = submitTime.split(':').map(Number);
                    const totalMinutes = (hours * 60 + minutes) + gapMinutes;
                    const newHours = Math.floor(totalMinutes / 60);
                    const newMins = totalMinutes % 60;
                    calculatedTime = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
                } else {
                    // For subsequent events, start at the end time of previous event plus any gap
                    const [hours, minutes] = currentEndTime.split(':').map(Number);
                    const totalMinutes = (hours * 60 + minutes) + gapMinutes;
                    const newHours = Math.floor(totalMinutes / 60);
                    const newMins = totalMinutes % 60;
                    calculatedTime = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
                }

                // Calculate end time for this event
                const [startHours, startMinutes] = calculatedTime.split(':').map(Number);
                const endMinutes = (startHours * 60 + startMinutes) + newDuration;
                const endHours = Math.floor(endMinutes / 60);
                const endMins = endMinutes % 60;
                const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

                // Update current end time for next event
                currentEndTime = endTime;

                return {
                    ...event,
                    newTime: calculatedTime,
                    newEndTime: endTime,
                    newDuration,
                    newLocation: location,
                    hasConflicts: false, // No conflicts since we're replacing all events
                    conflicts: []
                };
            });

            recalculated[teacherId] = {
                teacherName,
                events: recalculatedEvents
            };
        });

        return recalculated;
    }, [eventsByTeacher, submitTime, location, durations, todayKiteEvents, reorderedEvents, eventGaps]);

    // Check if there are actual updates to be made (comparing current vs new values)
    const hasActualUpdates = useMemo(() => {
        if (!todayKiteEvents || todayKiteEvents.length === 0) return false;
        
        // Check each teacher's events for actual changes
        for (const [teacherId, teacherData] of Object.entries(eventsByTeacher)) {
            const originalEvents = teacherData.events;
            const recalculatedData = recalculatedEventsByTeacher[teacherId];
            const recalculatedEvents = recalculatedData?.events || [];

            for (let i = 0; i < originalEvents.length; i++) {
                const original = originalEvents[i];
                const recalculated = recalculatedEvents[i];
                
                if (!recalculated) continue;

                // Compare time (extract time from original date)
                const originalTime = new Date(original.date).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'Europe/Madrid'
                });
                
                // Compare duration
                const originalDuration = original.duration;
                const newDuration = recalculated.newDuration;
                
                // Compare location
                const originalLocation = original.location;
                const newLocation = recalculated.newLocation;
                
                // Compare date (check if target date is different from original event date)
                const originalDate = new Date(original.date).toDateString();
                const newDate = targetDate.toDateString();
                
                // If any value is different, there are updates to make
                if (originalTime !== recalculated.newTime || 
                    originalDuration !== newDuration || 
                    originalLocation !== newLocation ||
                    originalDate !== newDate) {
                    return true;
                }
            }
        }
        
        return false;
    }, [todayKiteEvents, eventsByTeacher, recalculatedEventsByTeacher, targetDate]);

    const eventCount = todayKiteEvents?.length || 0;

    if (eventCount === 0) {
        return (
            <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h4 className="text-sm font-medium mb-3">Selected Kite Events by Teacher:</h4>
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No events scheduled for today
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h4 className="text-sm font-medium">Edit Today&apos;s Kite Events by Teacher:</h4>
                    
                    {/* Current Date Display */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Currently: {selectedDate.toLocaleDateString()}
                    </div>
                    
                    {/* Target Date Picker */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Reschedule to:</span>
                        <input
                            type="date"
                            value={targetDate.toISOString().split('T')[0]}
                            onChange={(e) => setTargetDate(new Date(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>
                
                {/* Update Events Button */}
                <div className="flex items-center gap-2">
                    {updateSuccess && (
                        <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                            ✅ Updated successfully!
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={updateEventsWithCalculatedTime}
                        disabled={isUpdating || eventCount === 0 || (!hasChanges && !hasActualUpdates)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isUpdating || eventCount === 0 || (!hasChanges && !hasActualUpdates)
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : hasChanges
                                ? 'bg-orange-600 hover:bg-orange-700 text-white' // Orange for changes made
                                : 'bg-green-600 hover:bg-green-700 text-white'   // Green for normal update
                        }`}
                        title={
                            (!hasChanges && !hasActualUpdates) 
                                ? 'No changes to save - events are already up to date'
                                : hasChanges 
                                ? 'Save reordered events' 
                                : 'Update all events with new times and settings'
                        }
                    >
                        {isUpdating 
                            ? 'Updating...' 
                            : (!hasChanges && !hasActualUpdates)
                            ? 'No Changes'
                            : hasChanges 
                            ? 'Save Changes' 
                            : 'Update All Events'
                        }
                    </button>
                </div>
            </div>
            
            {Object.entries(eventsByTeacher).map(([teacherId, teacherData]) => {
                const { teacherName } = teacherData;
                const originalEvents = teacherData.events;
                const recalculatedData = recalculatedEventsByTeacher[teacherId];
                const recalculatedEvents = recalculatedData?.events || [];

                return (
                    <div key={teacherId} className="mb-6 border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Editing {originalEvents.length} event{originalEvents.length !== 1 ? 's' : ''} for teacher: <span className="text-blue-600 dark:text-blue-400">{teacherName}</span>
                            </h5>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {teacherId.slice(-6)}
                            </span>
                        </div>

                        {/* Side by side comparison */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Original Events */}
                            <div className="space-y-2">
                                <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Current Schedule</h6>
                                {originalEvents.map((event, index) => (
                                    <div
                                        key={`original-${event.id}`}
                                        className="p-3 rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">
                                                    #{index + 1}
                                                </span>
                                                <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">
                                                    {event.id.slice(-4)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                                <div><strong>Students:</strong> {event.students.map(s => s.name).join(', ')}</div>
                                                <div><strong>Time:</strong> {event.time}</div>
                                                <div><strong>Location:</strong> {event.location}</div>
                                                <div><strong>Duration:</strong> {formatDuration(event.duration)}</div>
                                                <div><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recalculated Events */}
                            <div className="space-y-2">
                                <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">New Schedule</h6>
                                {recalculatedEvents.map((event, index) => (
                                    <div
                                        key={`new-${event.id}`}
                                        className="p-3 rounded border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                                    >
                                        <div className="flex items-start gap-2">
                                            {/* Gap Controls */}
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gap:</div>
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustEventGap(event.id, 60)} // +1 hour
                                                        className="px-1.5 py-0.5 rounded text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                                                        title="Add 1 hour gap"
                                                    >
                                                        +1h
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustEventGap(event.id, 30)} // +30 minutes
                                                        className="px-1.5 py-0.5 rounded text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                                                        title="Add 30 minutes gap"
                                                    >
                                                        +30m
                                                    </button>
                                                    {(eventGaps[event.id] || 0) > 0 && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => adjustEventGap(event.id, -30)} // -30 minutes
                                                                className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300"
                                                                title="Remove 30 minutes gap"
                                                            >
                                                                -30m
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => adjustEventGap(event.id, -60)} // -1 hour
                                                                className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300"
                                                                title="Remove 1 hour gap"
                                                                disabled={(eventGaps[event.id] || 0) < 60}
                                                            >
                                                                -1h
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                {(eventGaps[event.id] || 0) > 0 && (
                                                    <div className="text-center text-orange-600 dark:text-orange-400 font-medium border p-1 rounded">
                                                        +{Math.floor((eventGaps[event.id] || 0) / 60)}h{((eventGaps[event.id] || 0) % 60) > 0 ? ` ${(eventGaps[event.id] || 0) % 60}m` : ''}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reorder Controls */}
                                            <div className="flex flex-col gap-1 mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveEvent(teacherId, index, 'up')}
                                                    disabled={index === 0}
                                                    className={`p-1 rounded text-xs ${
                                                        index === 0
                                                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    }`}
                                                    title="Move up"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveEvent(teacherId, index, 'down')}
                                                    disabled={index === recalculatedEvents.length - 1}
                                                    className={`p-1 rounded text-xs ${
                                                        index === recalculatedEvents.length - 1
                                                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    }`}
                                                    title="Move down"
                                                >
                                                    ↓
                                                </button>
                                            </div>

                                            {/* Event Content */}
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">
                                                        #{index + 1}
                                                    </span>
                                                    <span className="text-xs font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1 py-0.5 rounded">
                                                        {event.id.slice(-4)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                                    <div><strong>Students:</strong> {event.students.map((s: any) => s.name).join(', ')}</div>
                                                    <div><strong>Time:</strong> {event.newTime} - {event.newEndTime}</div>
                                                    <div><strong>Location:</strong> {event.newLocation}</div>
                                                    <div><strong>Duration:</strong> {formatDuration(event.newDuration)}</div>
                                                    <div><strong>Date:</strong> {targetDate.toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
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
    todayKiteEvents
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
    const [showPushbackEvents, setShowPushbackEvents] = useState(false);

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
                if (!acc[lesson.teacher.id]) {
                    acc[lesson.teacher.id] = [];
                }
                acc[lesson.teacher.id].push(lesson);
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
                if (!acc[lesson.teacher.id]) {
                    acc[lesson.teacher.id] = [];
                }
                acc[lesson.teacher.id].push(lesson);
                return acc;
            }, {} as Record<string, any[]>);

            Object.entries(lessonsByTeacher).forEach(([teacherId, teacherLessons]) => {
                let currentTime = submitTime;

                teacherLessons.forEach((lesson, index) => {
                    const lessonDuration = lesson.students.length > 1 ? durations.multiple : durations.single;

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

                    calculatedAvailability[lesson.lesson_id] = {
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
            {/* Header Section */}
            <div className="mb-6">
                {/* Title and Controls - Inline when space allows */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    {/* Title with Status Badge */}
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {selectedLessons.length > 0
                                ? `${selectedLessons.length} Lesson${selectedLessons.length === 1 ? '' : 's'} Selected`
                                : 'Lesson Planning'}
                        </h3>
                
                    </div>
                    
                    {/* Controls - Responsive Layout */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

                        <PushbackControl 
                            onClick={() => setShowPushbackEvents(prev => !prev)}
                            todayKiteEvents={todayKiteEvents}
                        />
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
                    />
                </div>
            )}

            {showPushbackEvents && (
                <SelectedKiteEventsDisplay 
                    todayKiteEvents={todayKiteEvents}
                    submitTime={submitTime}
                    location={location}
                    durations={durations}
                    selectedDate={selectedDate}
                    onClose={() => setShowPushbackEvents(false)}
                />
            )}

        </div>
    );
}