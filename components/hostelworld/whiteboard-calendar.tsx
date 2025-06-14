"use client";

import { useMemo, useState } from "react";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";
import { getDateString } from "@/components/getters";
import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { Printer, Grid, Share, FlagIcon } from "lucide-react";
import { WhiteboardCalendarProps, TeacherEvent } from "./types";
import { EventCard } from "@/rails/view/card/EventCard";

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

    const renderTeacherRow = (teacher: TeacherEvent) => {
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
            // For print view, use time-based grid with EventCards
            const allEventTimes = new Set<string>();
            
            // Collect all unique event times from all teachers
            allTeachers.forEach((t: TeacherEvent) => {
                const tNode = teacherEventLinkedList.getTeacherById(t.teacher.model.id);
                if (tNode) {
                    let current = tNode.eventHead;
                    while (current) {
                        allEventTimes.add(current.event.time);
                        current = current.next;
                    }
                }
            });
            
            const timeSlots = Array.from(allEventTimes).sort();
            if (timeSlots.length === 0) {
                return null;
            }
            
            const eventsByTime = new Map<string, typeof teacherEvents[0]>();
            teacherEvents.forEach(event => {
                eventsByTime.set(event.time, event);
            });
            
            return (
                <div 
                    key={teacher.teacher.model.id} 
                    className="grid gap-0 border-b border-gray-200 dark:border-gray-600 py-2" 
                    style={{ gridTemplateColumns: `200px repeat(${timeSlots.length}, 1fr)` }}
                >
                    {/* Teacher Name */}
                    <div className="font-medium text-sm truncate flex items-center gap-1 border-r border-gray-300 px-2">
                        <HeadsetIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>{teacher.teacher.model.name}</span>
                    </div>
                    
                    {/* Time Slots */}
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
                                ) : (
                                    <div className="text-center text-gray-400 text-xs">-</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }
        
        // Grid view - show events and gaps in designated slots using linked list's gap functionality
        const eventsWithGaps: Array<{type: 'event' | 'gap', data?: any, time?: string, gapMinutes?: number}> = [];
        
        // Use the linked list to traverse events and gaps
        let current = teacherNode.eventHead;
        while (current) {
            // Add the event
            eventsWithGaps.push({ type: 'event', data: current.event });
            
            // Check if there's a significant gap after this event
            if (current.gapAfter > 30) { // Only show gaps > 30 minutes
                const currentEndTime = addMinutesToTime(current.event.time, current.event.duration);
                const nextStartTime = current.next ? current.next.event.time : '';
                
                eventsWithGaps.push({ 
                    type: 'gap', 
                    time: nextStartTime ? `${currentEndTime} - ${nextStartTime}` : `${currentEndTime} - end`,
                    gapMinutes: current.gapAfter
                });
            }
            
            current = current.next;
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
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg min-h-[80px] flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">Empty</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const handlePrint = () => {
        setViewMode('print');

        setTimeout(() => {
            const originalTitle = document.title;
            const dateStr = getDateString(selectedDate);
            document.title = `${dateStr} - Tarifa Kite Hostel Lesson Planning`;

            const style = document.createElement('style');
            style.textContent = `
                @media print {
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
                    .print-hidden {
                        display: none !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                    }
                }
            `;
            document.head.appendChild(style);

            window.print();

            setTimeout(() => {
                document.head.removeChild(style);
                document.title = originalTitle;
                setViewMode('grid');
            }, 1000);
        }, 100);
    };

    const handleShare = async () => {
        // Generate share content
        const shareContent = generateShareContent();
        
        try {
            // Check if the Web Share API is supported
            if (navigator.share) {
                await navigator.share({
                    text: shareContent
                });
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareContent);
                
                // Show a temporary notification
                const notification = document.createElement('div');
                notification.textContent = 'Schedule copied to clipboard!';
                notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                document.body.appendChild(notification);

                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 3000);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        }
    };

    const generateShareContent = (): string => {
        const dateStr = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let scheduleText = `📅 ${dateStr} - Tarifa Kite Hostel Lesson Schedule\n\n`;

        // Get teachers with events
        const teachersWithEvents = allTeachers.filter((teacher: TeacherEvent) => {
            const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
            if (!teacherNode) return false;
            
            let hasEvents = false;
            let current = teacherNode.eventHead;
            while (current) {
                hasEvents = true;
                break;
            }
            return hasEvents;
        });

        if (teachersWithEvents.length === 0) {
            scheduleText += 'No lessons scheduled for this date.\n';
        } else {
            teachersWithEvents.forEach((teacher: TeacherEvent) => {
                const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
                if (!teacherNode) return;

                // Add teacher name with headset icon representation
                scheduleText += `🎧 ${teacher.teacher.model.name}:\n`;

                // Add each event
                let current = teacherNode.eventHead;
                while (current) {
                    const event = current.event;
                    const durationHours = (event.duration / 60).toFixed(1);
                    
                    // Format students with helmet icon representation
                    const studentList = event.students && event.students.length > 0
                        ? event.students.map((student: any) => `⛑️ ${student.name}`).join(', ')
                        : 'No students assigned';

                    scheduleText += `  • ${event.time} (${durationHours}h) - ${studentList}\n`;
                    current = current.next;
                }

                scheduleText += '\n';
            });
        }

        scheduleText += `🏄‍♂️ Generated at ${new Date().toLocaleTimeString()}`;
        return scheduleText;
    };

    return (
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 h-full" id="lesson-planning">
            <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium">
                        Tarifa Kite Hostel
                    </h3>
                    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex gap-1 items-center">
                            <FlagIcon/>{earliestTime}
                        </div>
                        <span className="text-sm text-blue-600 dark:text-blue-400">earliest</span>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3 print-hidden">
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
                        <div className="flex border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1 text-sm flex items-center gap-1 ${
                                    viewMode === 'grid' 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Grid className="w-4 h-4" />
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('print')}
                                className={`px-3 py-1 text-sm flex items-center gap-1 ${
                                    viewMode === 'print' 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                        </div>
                    </div>
                    
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg flex items-center gap-2 transition-colors border"
                    >
                        <Printer className="w-4 h-4" />
                        Print Schedule
                    </button>
                    
                    <button
                        onClick={handleShare}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg flex items-center gap-2 transition-colors border"
                    >
                        <Share className="w-4 h-4" />
                        Share Schedule
                    </button>
                </div>
            </div>
            
            {/* Header */}
            {viewMode === 'print' ? (
                <div id="print-view-container">
                    {(() => {
                        // Calculate time slots for print headers
                        const allEventTimes = new Set<string>();
                        allTeachers.forEach((teacher: TeacherEvent) => {
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
                                    No lessons scheduled for this date
                                </div>
                            );
                        }
                        
                        return (
                            <>
                                {/* Print Header with Time Slots */}
                                <div id="print-schedule-header" className="grid gap-0 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2" style={{gridTemplateColumns: `200px repeat(${timeSlots.length}, 1fr)`}}>
                                    <div className="font-bold text-sm flex items-center gap-1 border-r border-gray-300 px-2">
                                        <HeadsetIcon className="w-4 h-4" />
                                        Teacher
                                    </div>
                                    {timeSlots.map((timeSlot, index) => {
                                        const isLastColumn = index === timeSlots.length - 1;
                                        return (
                                            <div key={index} className={`text-sm font-bold text-center px-2 ${!isLastColumn ? 'border-r border-gray-300' : ''}`}>
                                                {timeSlot}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Print Content */}
                                <div id="print-view-table" className="overflow-x-auto overflow-y-auto max-h-[600px]">
                                    {allTeachers.map(renderTeacherRow).filter(Boolean)}
                                </div>
                            </>
                        );
                    })()}
                </div>
            ) : (
                <>
                    <div className={`grid gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2`} style={{ gridTemplateColumns: `200px repeat(${maxSlots}, 1fr)` }}>
                        <div className="font-bold text-sm flex items-center gap-1">
                            <HeadsetIcon className="w-4 h-4" />
                            Teacher
                        </div>
                        {Array.from({ length: maxSlots }, (_, index) => (
                            <div key={index} className="text-sm font-bold text-center">
                                Slot {index + 1}
                            </div>
                        ))}
                    </div>
                    
                    {/* Grid Content */}
                    <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                        {allTeachers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No teachers available for this date
                            </div>
                        ) : (
                            allTeachers.map(renderTeacherRow).filter(Boolean)
                        )}
                    </div>
                </>
            )}
            
            {/* Summary */}
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
                            {dateData.totalEvents.reduce((total: number, event: any) => total + (event.duration / 60), 0).toFixed(1)}h
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
        </div>
    );
}
