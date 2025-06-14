"use client";

import { useMemo, useState } from "react";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";
import { getDateString } from "@/components/getters";
import { EventCard } from "./event-card";
import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { HelmetIcon } from "@/assets/svg/HelmetIcon";
import { Printer, Grid, Share, FlagIcon } from "lucide-react";
import { WhiteboardCalendarProps, TeacherEvent } from "./types";

export function WhiteboardCalendar({ 
    bookingsData,
    whiteboardData,
    selectedDate,
    dateData,
    teacherEventLinkedList,
    earliestTime
}: WhiteboardCalendarProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'print'>('grid');
    
    // Helper function to get ordinal suffix
    const getOrdinalSuffix = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    // Get all teachers (not just those with events)
    const allTeachers = useMemo(() => {
        return dateData.todayTeacherLessonsEvent as TeacherEvent[];
    }, [dateData.todayTeacherLessonsEvent]);

    // Generate time slots based on events throughout the day
    const timeSlots = useMemo(() => {
        const allEventTimes = new Set<string>();
        
        // Collect all unique event times
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
        
        // Convert to sorted array
        const sortedTimes = Array.from(allEventTimes).sort();
        
        // Ensure we have at least some default slots if no events
        if (sortedTimes.length === 0) {
            return ['09:00', '11:00', '13:00', '15:00', '17:00'];
        }
        
        return sortedTimes;
    }, [allTeachers, teacherEventLinkedList]);

    const renderTeacherRow = (teacher: TeacherEvent, index: number) => {
        const teacherNode = teacherEventLinkedList.getTeacherById(teacher.teacher.model.id);
        
        // Create a map of time to event for this teacher
        const eventsByTime = new Map<string, any>();
        if (teacherNode) {
            let current = teacherNode.eventHead;
            while (current) {
                eventsByTime.set(current.event.time, current.event);
                current = current.next;
            }
        }
        
        // Check if teacher has any events - if not, don't render in any view
        const teacherEvents: any[] = [];
        if (teacherNode) {
            let current = teacherNode.eventHead;
            while (current) {
                teacherEvents.push(current.event);
                current = current.next;
            }
        }
        
        if (teacherEvents.length === 0) {
            return null; // Don't render teachers with no events in any view
        }
        
        if (viewMode === 'print') {
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
                    {timeSlots.map((timeSlot, index) => {
                        const event = eventsByTime.get(timeSlot);
                        const isLastColumn = index === timeSlots.length - 1;
                        
                        return (
                            <div key={`${teacher.teacher.model.id}-${timeSlot}`} className={`min-h-[60px] p-2 ${!isLastColumn ? 'border-r border-gray-300' : ''}`}>
                                {event ? (
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 text-xs">
                                        <div className="text-gray-600 dark:text-gray-400">{(event.duration / 60).toFixed(1)}h</div>
                                        {event.students && event.students.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {event.students.map((student: any, idx: number) => (
                                                    <div key={idx} className="text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                                                        <HelmetIcon className="w-3 h-3" />
                                                        {student.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 text-xs">-</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }
        
        // Grid view - show events as cards with gaps
        // teacherEvents already populated above
        
        // Find gaps between consecutive events
        const eventsWithGaps: Array<{type: 'event' | 'gap', data?: any, time?: string}> = [];
        
        for (let i = 0; i < teacherEvents.length; i++) {
            const currentEvent = teacherEvents[i];
            eventsWithGaps.push({ type: 'event', data: currentEvent });
            
            // Check if there's a gap to the next event
            if (i < teacherEvents.length - 1) {
                const nextEvent = teacherEvents[i + 1];
                const currentEndTime = addMinutesToTime(currentEvent.time, currentEvent.duration);
                
                // If there's a gap of more than 30 minutes, show it
                if (getTimeDifferenceMinutes(currentEndTime, nextEvent.time) > 30) {
                    eventsWithGaps.push({ 
                        type: 'gap', 
                        time: `${currentEndTime} - ${nextEvent.time}`
                    });
                }
            }
        }
        
        return (
            <div key={teacher.teacher.model.id} className="grid grid-cols-12 gap-2 border-b border-gray-200 dark:border-gray-600 py-2">
                {/* Teacher Name - 2 columns */}
                <div className="col-span-2 font-medium text-sm truncate flex items-center gap-1">
                    <HeadsetIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span>{teacher.teacher.model.name}</span>
                </div>
                
                {/* Events and Gaps - 10 columns */}
                <div className="col-span-10 flex gap-1">
                    {eventsWithGaps.map((item, slotIndex) => {
                        if (item.type === 'event') {
                            const event = item.data;
                            return (
                                <div key={`${teacher.teacher.model.id}-event-${slotIndex}`} className="min-h-[80px] flex-shrink-0 w-32">
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
                                </div>
                            );
                        } else {
                            // Gap
                            return (
                                <div key={`${teacher.teacher.model.id}-gap-${slotIndex}`} className="min-h-[80px] flex-shrink-0 w-24">
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-dashed border-yellow-300 dark:border-yellow-600 rounded-lg p-2 min-h-[80px] flex items-center justify-center">
                                        <div className="text-center text-yellow-600 dark:text-yellow-400 text-xs">
                                            <div className="font-medium">Gap</div>
                                            <div className="text-xs">{item.time}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        );
    };

    // Helper functions for time calculations
    const addMinutesToTime = (time: string, minutes: number): string => {
        const [hours, mins] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    };

    const getTimeDifferenceMinutes = (startTime: string, endTime: string): number => {
        const [startHours, startMins] = startTime.split(':').map(Number);
        const [endHours, endMins] = endTime.split(':').map(Number);
        const startTotalMins = startHours * 60 + startMins;
        const endTotalMins = endHours * 60 + endMins;
        return endTotalMins - startTotalMins;
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
                    <div id="print-view-table" className="overflow-x-auto overflow-y-auto max-h-[600px]">
                        {allTeachers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No teachers available for this date
                            </div>
                        ) : (
                            allTeachers.map(renderTeacherRow).filter(Boolean)
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-12 gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
                        <div className="col-span-2 font-bold text-sm flex items-center gap-1">
                            <HeadsetIcon className="w-4 h-4" />
                            Teacher
                        </div>
                        <div className="col-span-10 grid grid-cols-4 gap-2">
                            <div className="text-sm font-bold text-center">1st</div>
                            <div className="text-sm font-bold text-center">2nd</div>
                            <div className="text-sm font-bold text-center">3rd</div>
                            <div className="text-sm font-bold text-center">4th</div>
                        </div>
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
