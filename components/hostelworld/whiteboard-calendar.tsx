"use client";

import { useMemo, useState } from "react";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";
import { getDateString } from "@/components/getters";
import { formatDuration } from "@/components/formatters";
import { FlagIcon, Ambulance, MessageCircle, Printer } from "lucide-react";
import { EventToCsv } from "./event-to-csv";
import { WhiteboardCalendarProps, TeacherEvent } from "./types";
import { List, Table, FileText } from "lucide-react";
import { TEACHER_SORT_ORDER } from "./whiteboard-teacher-order";
import { CalendarTable } from "./CalendarTable";
import { CalendarGridDisplay } from "./CalendarGridDisplay";

// Types for sub-components
interface CalendarHeaderProps {
    selectedDate: Date;
    earliestTime: string;
    viewMode: "grid" | "table" | "csv";
    onViewModeChange: (mode: "grid" | "table" | "csv") => void;
    onPrint: () => void;
    onShare: () => void;
    onCommunicate: () => void;
    onWhatsApp: () => void;
}

interface CalendarGridProps {
    allTeachers: TeacherEvent[];
    maxEventSlots: number;
    teacherEventLinkedList: TeacherEventLinkedList;
    maxSlots: number;
    viewMode: "grid" | "table" | "csv";
    addMinutesToTime: (time: string, minutes: number) => string;
    dateData: any;
    selectedDate: Date;
}

// Header Component
const CalendarHeader = ({
    earliestTime,
    viewMode,
    onViewModeChange,
    onPrint,
    onShare,
    onCommunicate,
    onWhatsApp,
}: CalendarHeaderProps) => {
    return (
        <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex gap-1 items-center">
                        <FlagIcon />
                        {earliestTime}
                    </div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                        earliest
                    </span>
                </div>
            </div>
            <div className="flex gap-2 print-hidden">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => onViewModeChange("grid")}
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-200 dark:border-gray-600 ${viewMode === "grid" ? "bg-gray-700 text-white" : "bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"}`}
                    >
                        <List className="w-4 h-4 inline-block mr-1" /> Grid
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewModeChange("table")}
                        className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-200 dark:border-gray-600 ${viewMode === "table" ? "bg-gray-700 text-white" : "bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"}`}
                    >
                        <Table className="w-4 h-4 inline-block mr-1" /> Table
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewModeChange("csv")}
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-200 dark:border-gray-600 ${viewMode === "csv" ? "bg-gray-700 text-white" : "bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"}`}
                    >
                        <FileText className="w-4 h-4 inline-block mr-1" /> CSV
                    </button>
                </div>
                <button
                    onClick={onPrint}
                    disabled={viewMode === "grid"}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${viewMode === "grid" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-700"}`}
                >
                    <Printer className="w-4 h-4" />
                    Print
                </button>
                {/* <button
                onClick={onShare}
                className="flex items-center gap-2 px-3 py-2 border border-green-500 text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 rounded-lg text-sm hover:border-green-700"
            >
                <Share className="w-4 h-4" />
                Share
            </button> */}
                <button
                    onClick={onCommunicate}
                    className="flex items-center gap-2 px-3 py-2 border border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-gray-800 rounded-lg text-sm hover:border-orange-700"
                >
                    <Ambulance className="w-4 h-4" />
                    Insurance
                </button>
                <button
                    onClick={onWhatsApp}
                    className="flex items-center gap-2 px-3 py-2 border border-green-600 text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 rounded-lg text-sm hover:border-green-800"
                >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                </button>
            </div>
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
    addMinutesToTime,
    dateData,
    selectedDate,
}: CalendarGridProps) => {
    if (viewMode === "csv") {
        return (
            <div id="csv-view-container">
                <EventToCsv
                    kiteEvents={dateData.totalEvents}
                    selectedDate={selectedDate}
                />
            </div>
        );
    }
    if (viewMode === "table") {
        return (
            <CalendarTable
                allTeachers={allTeachers}
                teacherEventLinkedList={teacherEventLinkedList}
                maxSlots={maxSlots}
                addMinutesToTime={addMinutesToTime}
            />
        );
    }

    // Grid view
    return (
        <CalendarGridDisplay
            allTeachers={allTeachers}
            maxEventSlots={maxEventSlots}
            teacherEventLinkedList={teacherEventLinkedList}
            maxSlots={maxSlots}
            addMinutesToTime={addMinutesToTime}
        />
    );
};

// Summary Stats Component
const SummaryStats = ({ dateData }: { dateData: any }) => (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 print-hidden">
        <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="text-green-600 dark:text-green-400 font-medium">
                    Total Kite Lessons
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {dateData.totalEvents.length}
                </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-blue-600 dark:text-blue-400 font-medium">
                    Total Kite Hours
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatDuration(
                        dateData.totalEvents.reduce(
                            (total: number, event: any) => total + event.duration,
                            0,
                        ),
                    )}
                </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="text-yellow-600 dark:text-yellow-400 font-medium">
                    Total Kite Revenue
                </div>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    €
                    {dateData.totalEvents
                        .reduce((total: number, event: any) => {
                            const durationHours = event.duration / 60;
                            const pricePerHour = event.pricePerHour || 0;
                            return total + durationHours * pricePerHour;
                        }, 0)
                        .toFixed(0)}
                </div>
            </div>
        </div>
    </div>
);

export function WhiteboardCalendar({
    selectedDate,
    dateData,
    teacherEventLinkedList,
    earliestTime,
}: WhiteboardCalendarProps) {
    const [viewMode, setViewMode] = useState<"grid" | "table" | "csv">("grid");

    // Helper functions for time calculations
    const addMinutesToTime = (time: string, minutes: number): string => {
        const [hours, mins] = time.split(":").map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
    };

    // Get all teachers (not just those with events)
    const allTeachers = useMemo(() => {
        const sortedTeachers = [...dateData.todayTeacherLessonsEvent].sort(
            (a, b) => {
                const aIndex = TEACHER_SORT_ORDER.indexOf(a.teacher.model.name);
                const bIndex = TEACHER_SORT_ORDER.indexOf(b.teacher.model.name);

                if (aIndex === -1 && bIndex === -1) {
                    return a.teacher.model.name.localeCompare(b.teacher.model.name); // Both not in list, sort alphabetically
                }
                if (aIndex === -1) {
                    return 1; // a is not in the list, so it comes after b
                }
                if (bIndex === -1) {
                    return -1; // b is not in the list, so it comes after a
                }
                return aIndex - bIndex; // Sort based on the index in the list
            },
        );
        return sortedTeachers as TeacherEvent[];
    }, [dateData.todayTeacherLessonsEvent]);

    // Calculate maximum number of slots needed (including gaps) using the linked list's gap functionality
    const maxSlots = useMemo(() => {
        let maxEventsWithGaps = 0;
        allTeachers.forEach((teacher: TeacherEvent) => {
            const teacherNode = teacherEventLinkedList.getTeacherById(
                teacher.teacher.model.id,
            );
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
            const teacherNode = teacherEventLinkedList.getTeacherById(
                teacher.teacher.model.id,
            );
            if (teacherNode && teacherNode.hasEvents()) {
                maxEvents = Math.max(maxEvents, teacherNode.eventCount);
            }
        });
        return maxEvents;
    }, [allTeachers, teacherEventLinkedList]);

    const handlePrint = () => {
        const originalTitle = document.title;
        const dateStr = getDateString(selectedDate);
        document.title = `${dateStr} - Tarifa Kite Hostel Lesson Planning`;

        const style = document.createElement("style");
        style.textContent = `
            @media print {
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                body * {
                    visibility: hidden;
                }
                #${viewMode}-view-container, #${viewMode}-view-container * {
                    visibility: visible !important;
                }
                #${viewMode}-view-container {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    background: white !important;
                }
                .print-hidden {
                    display: none !important;
                }
                @page {
                    size: ${viewMode === "csv" ? "A4 portrait" : "A4 landscape"};
                    margin: 1cm;
                }
            }
        `;
        document.head.appendChild(style);

        window.print();

        style.remove();
        document.title = originalTitle;
    };

    const handleShare = () => {
        try {
            const dateStr = selectedDate.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            let scheduleText = `📅 ${dateStr} - Tarifa Kite Hostel Lesson Schedule\n\n`;

            // Get teachers with events
            const teachersWithEvents = allTeachers.filter((teacher: TeacherEvent) => {
                const teacherNode = teacherEventLinkedList.getTeacherById(
                    teacher.teacher.model.id,
                );
                if (!teacherNode) return false;
                return teacherNode.hasEvents();
            });

            teachersWithEvents.forEach((teacher: TeacherEvent) => {
                const teacherNode = teacherEventLinkedList.getTeacherById(
                    teacher.teacher.model.id,
                );
                if (!teacherNode) return;

                scheduleText += `👨‍🏫 ${teacher.teacher.model.name}:\n`;

                let current = teacherNode.eventHead;
                while (current) {
                    const event = current.event;
                    const durationFormatted = formatDuration(event.duration);
                    const studentsText =
                        event.students && event.students.length > 0
                            ? event.students
                                .map((student: any) => `⛑️ ${student.name}`)
                                .join(", ")
                            : "No students";

                    scheduleText += `  • ${event.time} - ${durationFormatted} (${event.location || "No location"}) - ${studentsText}\n`;
                    current = current.next;
                }
                scheduleText += "\n";
            });

            // Add summary
            const totalEvents = dateData.totalEvents.length;
            const totalDuration = dateData.totalEvents.reduce(
                (total: number, event: any) => total + event.duration,
                0,
            );
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
                alert("Schedule copied to clipboard!");
            }
        } catch (error: any) {
            console.error("Error sharing:", error);
            alert("Error sharing schedule");
        }
    };

    const handleCommunicate = () => {
        try {
            const dateStr = selectedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            // Count total kite events
            const totalKiteEvents = dateData.totalEvents.length;

            // Get all students with their passport numbers from kite events
            const studentsWithPassports: Array<{
                name: string;
                passport: string | null;
            }> = [];

            dateData.totalEvents.forEach((event: any) => {
                if (event.students && event.students.length > 0) {
                    event.students.forEach((student: any) => {
                        // Check if student already added
                        if (!studentsWithPassports.find((s) => s.name === student.name)) {
                            studentsWithPassports.push({
                                name: student.name,
                                passport: student.passport_number || null,
                            });
                        }
                    });
                }
            });

            // Create email content
            let emailBody = `Tarifa Kite Hostel\n\n`;
            emailBody += `Date: ${dateStr}\n`;
            emailBody += `Lessons: ${studentsWithPassports.length}\n\n`;

            if (studentsWithPassports.length > 0) {
                emailBody += `Student Details:\n`;
                studentsWithPassports.forEach((student, index) => {
                    emailBody += `${index + 1}. ${student.name}`;
                    if (student.passport) {
                        emailBody += ` - Passport: ${student.passport}`;
                    } else {
                        emailBody += ` - Passport: Not provided`;
                    }
                    emailBody += `\n`;
                });
            } else {
                emailBody += `No students scheduled for kite events on this date.\n`;
            }

            // Create mailto URL
            const subject = encodeURIComponent(
                `Tarifa Kite Hostel - ${dateStr} Student Information`,
            );
            const body = encodeURIComponent(emailBody);
            const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

            // Open default email client
            window.location.href = mailtoUrl;
        } catch (error: any) {
            console.error("Error creating email:", error);
            alert("Error creating email");
        }
    };

    const handleWhatsApp = () => {
        try {
            const dateStr = selectedDate.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            let whatsappText = `*${dateStr} - Tarifa Kite Hostel Lesson Schedule*\n\n`;

            // Get teachers with events
            const teachersWithEvents = allTeachers.filter((teacher: TeacherEvent) => {
                const teacherNode = teacherEventLinkedList.getTeacherById(
                    teacher.teacher.model.id,
                );
                if (!teacherNode) return false;
                return teacherNode.hasEvents();
            });

            teachersWithEvents.forEach((teacher: TeacherEvent) => {
                const teacherNode = teacherEventLinkedList.getTeacherById(
                    teacher.teacher.model.id,
                );
                if (!teacherNode) return;

                whatsappText += `*Teacher: ${teacher.teacher.model.name}*\n`;

                let current = teacherNode.eventHead;
                while (current) {
                    const event = current.event;
                    const durationFormatted = formatDuration(event.duration);
                    const studentsText =
                        event.students && event.students.length > 0
                            ? event.students.map((student: any) => student.name).join(", ")
                            : "No students";

                    whatsappText += `- ${event.time} - ${durationFormatted} (${event.location || "No location"}) - ${studentsText}\n`;
                    current = current.next;
                }
                whatsappText += "\n";
            });

            // Create WhatsApp URL - avoid double encoding
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

            // Open WhatsApp
            window.open(whatsappUrl, "_blank");
        } catch (error: any) {
            console.error("Error sharing to WhatsApp:", error);
            alert("Error sharing to WhatsApp");
        }
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 border rounded-lg p-4 h-full"
            id="lesson-planning"
        >
            <CalendarHeader
                selectedDate={selectedDate}
                earliestTime={earliestTime}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onPrint={handlePrint}
                onShare={handleShare}
                onCommunicate={handleCommunicate}
                onWhatsApp={handleWhatsApp}
            />

            <CalendarGrid
                allTeachers={allTeachers}
                maxEventSlots={maxEventSlots}
                teacherEventLinkedList={teacherEventLinkedList}
                maxSlots={maxSlots}
                viewMode={viewMode}
                addMinutesToTime={addMinutesToTime}
                dateData={dateData}
                selectedDate={selectedDate}
            />

            <SummaryStats dateData={dateData} />
        </div>
    );
}
