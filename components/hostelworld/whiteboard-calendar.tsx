"use client";

import { useMemo, useState } from "react";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";
import { getDateString } from "@/components/getters";
import { formatDuration, formatDateNow } from "@/components/formatters";
import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { Printer, Grid, Share, FlagIcon } from "lucide-react";
import { WhiteboardCalendarProps, TeacherEvent } from "./types";
import { EventCard } from "@/rails/view/card/EventCard";

// Types for sub-components
interface CalendarHeaderProps {
    selectedDate: Date;
    earliestTime: string;
    viewMode: 'grid' | 'print';
    onViewModeChange: (mode: 'grid' | 'print') => void;
    onPrint: () => void;
    onShare: () => void;
}

interface TeacherRowProps {
    teacher: TeacherEvent;
    teacherEventLinkedList: TeacherEventLinkedList;
    maxSlots: number;
    viewMode: 'grid' | 'print';
    addMinutesToTime: (time: string, minutes: number) => string;
}

interface CalendarGridProps {
    allTeachers: TeacherEvent[];
    maxEventSlots: number;
    teacherEventLinkedList: TeacherEventLinkedList;
    maxSlots: number;
    viewMode: 'grid' | 'print';
    addMinutesToTime: (time: string, minutes: number) => string;
}

// Header Component
const CalendarHeader = ({
    selectedDate,
    earliestTime,
    viewMode,
    onViewModeChange,
    onPrint,
    onShare
}: CalendarHeaderProps) => (
    <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium">
                {formatDateNow(selectedDate)}
            </h3>
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex gap-1 items-center">
                    <FlagIcon />{earliestTime}
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400">earliest</span>
            </div>
        </div>
        <div className="flex gap-2 print-hidden">
            <button
                onClick={() => onViewModeChange(viewMode === 'grid' ? 'print' : 'grid')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                {viewMode === 'grid' ? <Printer className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                {viewMode === 'grid' ? 'Print View' : 'Grid View'}
            </button>
            <button
                onClick={onPrint}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
                <Printer className="w-4 h-4" />
                Print
            </button>
            <button
                onClick={onShare}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
                <Share className="w-4 h-4" />
                Share
            </button>
        </div>
    </div>
);

// Teacher Row Component
const TeacherRow = ({
    teacher,
    teacherEventLinkedList,
    maxSlots,
    viewMode,
    addMinutesToTime
}: TeacherRowProps) => {
    const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);

    // Get all events for this teacher in order
    const teacherEvents: Array<{
        id: string;
        time: string;
        duration: number;
        date: string;
        status: string;
        location: string;
        students: Array<{ id: string; name: string }>;
    }> = [];

    if (teacherNode) {
        let current = teacherNode.eventHead;
        while (current) {
            teacherEvents.push(current.event);
            current = current.next;
        }
    }

    // Don't render teachers with no events
    if (teacherEvents.length === 0) {
        return null;
    }

    if (viewMode === 'print') {
        // Print view logic for teacher row - each event takes exactly one slot matching its time
        if (teacherEvents.length === 0) {
            return null;
        }

        // Get all unique time slots from all teachers for consistent grid
        const allEventTimes = new Set<string>();
        // We need to get the global time slots, not just this teacher's times
        // This should match what's calculated in CalendarGrid
        
        // Create a map of events by their start time
        const eventsByTime = new Map<string, typeof teacherEvents[0]>();
        teacherEvents.forEach(event => {
            eventsByTime.set(event.time, event);
        });

        // Get the time slots from the parent context (we'll need to pass this down)
        // For now, let's collect all possible times from the linked list
        const allTeachers = teacherEventLinkedList.getTeachers();
        
        allTeachers.forEach((tNode) => {
            let current = tNode.eventHead;
            while (current) {
                allEventTimes.add(current.event.time);
                current = current.next;
            }
        });

        const timeSlots = Array.from(allEventTimes).sort();

        return (
            <div
                key={teacher.teacher.model.id}
                className="grid gap-0 border-b border-gray-200 dark:border-gray-600 py-2"
                style={{ gridTemplateColumns: `200px repeat(${timeSlots.length}, 1fr)` }}
            >
                {/* Teacher Name */}
                <div className="font-medium text-xl truncate flex items-center gap-1 border-r border-gray-300 px-2">
                    <HeadsetIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span>{teacher.teacher.model.name}</span>
                </div>

                {/* Time Slots - show event if it matches this time, empty otherwise */}
                {timeSlots.map((timeSlot, slotIndex) => {
                    const event = eventsByTime.get(timeSlot);
                    const isLastColumn = slotIndex === timeSlots.length - 1;

                    return (
                        <div key={`${teacher.teacher.model.id}-${timeSlot}`} className={`min-h-[60px] p-2 ${!isLastColumn ? 'border-r border-gray-300' : ''}`}>
                            {event ? (
                                <EventCard
                                    event={{
                                        id: event.id,
                                        time: event.time,
                                        duration: event.duration,
                                        date: event.date,
                                        status: event.status,
                                        location: event.location,
                                        students: event.students || []
                                    }}
                                    viewMode={viewMode}
                                />
                            ) : null}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Grid view logic for teacher row
    const eventsWithGaps: Array<{ type: 'event' | 'gap', data?: any, time?: string, gapMinutes?: number }> = [];

    if (teacherNode) {
        // Iterate through events using the linked list structure
        let current = teacherNode.eventHead;

        while (current) {
            // Add the current event
            eventsWithGaps.push({ type: 'event', data: current.event });

            // Check for gap to next event
            if (current.next) {
                const currentEndTime = addMinutesToTime(current.event.time, current.event.duration);
                const nextStartTime = current.next.event.time;

                // Calculate gap in minutes
                const [currentHours, currentMins] = currentEndTime.split(':').map(Number);
                const [nextHours, nextMins] = nextStartTime.split(':').map(Number);
                const currentEndMinutes = currentHours * 60 + currentMins;
                const nextStartMinutes = nextHours * 60 + nextMins;
                const gapMinutes = nextStartMinutes - currentEndMinutes;

                if (gapMinutes > 30) { // Only show significant gaps
                    eventsWithGaps.push({
                        type: 'gap',
                        time: currentEndTime,
                        gapMinutes: gapMinutes
                    });
                }
            }

            current = current.next;
        }
    }

    return (
        <div key={teacher.teacher.model.id} className={`grid gap-2 border-b border-gray-200 dark:border-gray-600 py-2`} style={{ gridTemplateColumns: `200px repeat(${maxSlots}, 1fr)` }}>
            {/* Teacher Name */}
            <div className="font-medium text-sm truncate flex items-center gap-1">
                <HeadsetIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span>{teacher.teacher.model.name}</span>
            </div>

            {/* Event and Gap Slots */}
            {Array.from({ length: maxSlots }, (_, slotIndex) => {
                const item = eventsWithGaps[slotIndex];

                return (
                    <div key={`${teacher.teacher.model.id}-slot-${slotIndex}`} className="min-h-[80px]">
                        {item ? (
                            item.type === 'event' ? (
                                <EventCard
                                    event={{
                                        id: item.data.id,
                                        time: item.data.time,
                                        duration: item.data.duration,
                                        date: item.data.date,
                                        status: item.data.status,
                                        location: item.data.location,
                                        students: item.data.students || []
                                    }}
                                    viewMode={viewMode}
                                />
                            ) : (
                                // Gap
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-dashed border-yellow-300 dark:border-yellow-600 rounded-lg p-2 min-h-[80px] flex items-center justify-center">
                                    <div className="text-center text-yellow-600 dark:text-yellow-400 text-xs">
                                        <div className="font-medium">Gap</div>
                                        <div className="text-xs">{item.time}</div>
                                    </div>
                                </div>
                            )
                        ) : (
                            // Empty slot - show nothing
                            <div className="min-h-[80px]"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Calendar Grid Component  
const CalendarGrid = ({
    allTeachers,
    maxEventSlots,
    teacherEventLinkedList,
    maxSlots,
    viewMode,
    addMinutesToTime
}: CalendarGridProps) => {
    if (viewMode === 'print') {
        // Print view header and content - collect all unique event times
        const allEventTimes = new Set<string>();
        allTeachers.forEach((teacher) => {
            const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
            if (teacherNode) {
                let current = teacherNode.eventHead;
                while (current) {
                    allEventTimes.add(current.event.time);
                    current = current.next;
                }
            }
        });

        const timeSlots = Array.from(allEventTimes).sort();

        if (timeSlots.length === 0) {
            return (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No events scheduled for this date
                </div>
            );
        }

        return (
            <div id="print-view-container">
                {/* Print Header with Time Slots */}
                <div id="print-schedule-header" className="grid gap-0 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2" style={{ gridTemplateColumns: `200px repeat(${timeSlots.length}, 1fr)` }}>
                    <div className="font-bold text-xl flex items-center gap-1 border-r border-gray-300 px-2">
                        <HeadsetIcon className="w-4 h-4" />
                        Teacher
                    </div>
                    {timeSlots.map((timeSlot, index) => {
                        const isLastColumn = index === timeSlots.length - 1;
                        return (
                            <div key={timeSlot} className={`text-sm font-bold text-center py-2 ${!isLastColumn ? 'border-r border-gray-300' : ''}`}>
                                {timeSlot}
                            </div>
                        );
                    })}
                </div>

                {/* Print Content */}
                <div className="overflow-visible">
                    {allTeachers.map(teacher => (
                        <TeacherRow
                            key={teacher.teacher.model.id}
                            teacher={teacher}
                            teacherEventLinkedList={teacherEventLinkedList}
                            maxSlots={maxSlots}
                            viewMode={viewMode}
                            addMinutesToTime={addMinutesToTime}
                        />
                    )).filter(Boolean)}
                </div>
            </div>
        );
    }

    // Grid view
    // Check if there are any events across all teachers
    const hasAnyEvents = allTeachers.some((teacher) => {
        const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
        return teacherNode && teacherNode.hasEvents();
    });

    if (!hasAnyEvents) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No events scheduled for this date
            </div>
        );
    }

    return (
        <>
            <div className={`grid gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2`} style={{ gridTemplateColumns: `200px repeat(${maxEventSlots}, 1fr)` }}>
                <div className="font-bold text-sm flex items-center gap-1">
                    <HeadsetIcon className="w-4 h-4" />
                    Teacher
                </div>
                {Array.from({ length: maxEventSlots }, (_, index) => (
                    <div key={index} className="text-sm font-bold text-left">
                        Slot {index + 1}
                    </div>
                ))}
            </div>

            {/* Grid Content */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                {allTeachers.map(teacher => (
                    <TeacherRow
                        key={teacher.teacher.model.id}
                        teacher={teacher}
                        teacherEventLinkedList={teacherEventLinkedList}
                        maxSlots={maxSlots}
                        viewMode={viewMode}
                        addMinutesToTime={addMinutesToTime}
                    />
                )).filter(Boolean)}
            </div>
        </>
    );
};

// Summary Stats Component
const SummaryStats = ({ dateData }: { dateData: any }) => (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 print-hidden">
        <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="text-green-600 dark:text-green-400 font-medium">Total Kite Lessons</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {dateData.totalEvents.length}
                </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-blue-600 dark:text-blue-400 font-medium">Total Kite Hours</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatDuration(dateData.totalEvents.reduce((total: number, event: any) => total + event.duration, 0))}
                </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="text-yellow-600 dark:text-yellow-400 font-medium">Total Kite Revenue</div>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    €{dateData.totalEvents.reduce((total: number, event: any) => {
                        const durationHours = event.duration / 60;
                        const pricePerHour = event.pricePerHour || 0;
                        return total + (durationHours * pricePerHour);
                    }, 0).toFixed(0)}
                </div>
            </div>
        </div>
    </div>
);

export function WhiteboardCalendar({
    selectedDate,
    dateData,
    teacherEventLinkedList,
    earliestTime
}: WhiteboardCalendarProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'print'>('grid');

    // Helper functions for time calculations
    const addMinutesToTime = (time: string, minutes: number): string => {
        const [hours, mins] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    };

    // Get all teachers (not just those with events)
    const allTeachers = useMemo(() => {
        return dateData.todayTeacherLessonsEvent as TeacherEvent[];
    }, [dateData.todayTeacherLessonsEvent]);

    // Calculate maximum number of slots needed (including gaps) using the linked list's gap functionality
    const maxSlots = useMemo(() => {
        let maxEventsWithGaps = 0;
        allTeachers.forEach((teacher: TeacherEvent) => {
            const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
            if (teacherNode && teacherNode.hasEvents()) {
                // Use the linked list's built-in gap calculation
                const gaps = teacherNode.getAllGaps();
                const significantGaps = gaps.filter((gap: number) => gap > 30); // Only count gaps > 30 minutes

                // Total slots = events + significant gaps
                const eventsWithGaps = teacherNode.eventCount + significantGaps.length;
                maxEventsWithGaps = Math.max(maxEventsWithGaps, eventsWithGaps);
            }
        });
        return Math.max(maxEventsWithGaps, 4); // Minimum 4 slots
    }, [allTeachers, teacherEventLinkedList]);

    // Calculate maximum number of actual event slots (no gaps, no padding)
    const maxEventSlots = useMemo(() => {
        let maxEvents = 0;
        allTeachers.forEach((teacher: TeacherEvent) => {
            const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
            if (teacherNode && teacherNode.hasEvents()) {
                maxEvents = Math.max(maxEvents, teacherNode.eventCount);
            }
        });
        return maxEvents;
    }, [allTeachers, teacherEventLinkedList]);

    const handlePrint = () => {
        setViewMode('print');

        setTimeout(() => {
            const originalTitle = document.title;
            const dateStr = getDateString(selectedDate);
            document.title = `${dateStr} - Tarifa Kite Hostel Lesson Planning`;

            const style = document.createElement('style');
            style.textContent = `
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #print-view-container {
                        visibility: visible !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        background: white !important;
                    }
                    #print-view-container * {
                        visibility: visible !important;
                    }
                    #print-view-container::before {
                        content: "${dateStr} - Tarifa Kite Hostel Lesson Planning";
                        display: block !important;
                        text-align: center !important;
                        font-size: 28px !important;
                        font-weight: bold !important;
                        color: black !important;
                        margin-bottom: 30px !important;
                        padding: 20px 0 !important;
                        border-bottom: 2px solid #333 !important;
                    }
                    .print-hidden {
                        display: none !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                        margin-top: 0.5cm;
                        margin-bottom: 0.5cm;
                        @top-left { content: ""; }
                        @top-center { content: ""; }
                        @top-right { content: ""; }
                        @bottom-left { content: ""; }
                        @bottom-center { content: ""; }
                        @bottom-right { content: ""; }
                    }
                }
            `;
            document.head.appendChild(style);

            window.print();

            style.remove();
            document.title = originalTitle;
        }, 100);
    };

    const handleShare = () => {
        try {
            const dateStr = selectedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            let scheduleText = `📅 ${dateStr} - Tarifa Kite Hostel Lesson Schedule\n\n`;

            // Get teachers with events
            const teachersWithEvents = allTeachers.filter((teacher: TeacherEvent) => {
                const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
                if (!teacherNode) return false;
                return teacherNode.hasEvents();
            });

            teachersWithEvents.forEach((teacher: TeacherEvent) => {
                const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
                if (!teacherNode) return;

                scheduleText += `👨‍🏫 ${teacher.teacher.model.name}:\n`;

                let current = teacherNode.eventHead;
                while (current) {
                    const event = current.event;
                    const durationFormatted = formatDuration(event.duration);
                    const studentsText = event.students && event.students.length > 0
                        ? event.students.map((student: any) => `⛑️ ${student.name}`).join(', ')
                        : 'No students';

                    scheduleText += `  • ${event.time} - ${durationFormatted} (${event.location || 'No location'}) - ${studentsText}\n`;
                    current = current.next;
                }
                scheduleText += '\n';
            });

            // Add summary
            const totalEvents = dateData.totalEvents.length;
            const totalDuration = dateData.totalEvents.reduce((total: number, event: any) => total + event.duration, 0);
            const totalHoursFormatted = formatDuration(totalDuration);

            scheduleText += `📊 Summary:\n`;
            scheduleText += `Total Lessons: ${totalEvents}\n`;
            scheduleText += `Total Hours: ${totalHoursFormatted}\n`;

            if (navigator.share) {
                navigator.share({
                    title: `${dateStr} - Lesson Schedule`,
                    text: scheduleText,
                });
            } else {
                navigator.clipboard.writeText(scheduleText);
                alert('Schedule copied to clipboard!');
            }
        } catch (error: any) {
            console.error('Error sharing:', error);
            alert('Error sharing schedule');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 h-full" id="lesson-planning">
            <CalendarHeader
                selectedDate={selectedDate}
                earliestTime={earliestTime}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onPrint={handlePrint}
                onShare={handleShare}
            />

            <CalendarGrid
                allTeachers={allTeachers}
                maxEventSlots={maxEventSlots}
                teacherEventLinkedList={teacherEventLinkedList}
                maxSlots={maxSlots}
                viewMode={viewMode}
                addMinutesToTime={addMinutesToTime}
            />

            <SummaryStats dateData={dateData} />
        </div>
    );
}
