"use client";

import { useState, useMemo, useEffect } from "react";
import { WhiteboardNavigation } from "./whiteboard-navigation";
import { WhiteboardCalendar } from "./whiteboard-calendar";
import { WhiteboardPins } from "./whiteboard-pins";
import { EventController } from "./event-controller";
import { StudentEntityColumn } from "./student-entity-column";
import { TeacherEntityColumn } from "./teacher-entity-column";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";
import { useAdmin } from "@/providers/AdminProvider";
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { useWhiteboardBackend } from "./whiteboard-backend";
import { LessonWithStudents } from "./types";

export default function WhiteboardPlanning() {
    const { bookingsData, teachersData } = useAdmin();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedLessonsForEvent, setSelectedLessonsForEvent] = useState<LessonWithStudents[]>([]);

    // Load selected date from localStorage on mount
    useEffect(() => {
        const savedDate = localStorage.getItem('whiteboard-selected-date');
        if (savedDate) {
            const parsedDate = new Date(savedDate);
            // Check if the parsed date is valid and not older than 30 days
            const now = new Date();
            const daysDiff = Math.abs((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
            if (!isNaN(parsedDate.getTime()) && daysDiff <= 30) {
                setSelectedDate(parsedDate);
            }
        }
    }, []);

    // Save selected date to localStorage when it changes
    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        localStorage.setItem('whiteboard-selected-date', date.toISOString());
    };

    // Use the whiteboard backend to process data
    const whiteboardData = useWhiteboardBackend({
        bookings: bookingsData || [],
        teachers: teachersData || []
    });

    const isBookingOnDate = (booking: DrizzleData<BookingType>, date: Date) => {
        const bookingStart = new Date(booking.model.date_start);
        const bookingEnd = new Date(booking.model.date_end);

        const selectedDateStart = new Date(date);
        selectedDateStart.setHours(0, 0, 0, 0);

        const selectedDateEnd = new Date(date);
        selectedDateEnd.setHours(23, 59, 59, 999);

        return bookingStart <= selectedDateEnd && bookingEnd >= selectedDateStart;
    };

    const filteredBookings = useMemo(() => {
        return bookingsData.filter((booking) => isBookingOnDate(booking, selectedDate));
    }, [bookingsData, selectedDate]);

    // Get date-specific data from the backend
    const dateData = whiteboardData.getDateData(selectedDate);
    const {
        todayTeacherLessonsEvent,
        totalEvents,
        teacherConfirmationEvents,
        availableLessonsFromBookings
    } = dateData;

    // Filter lessons that have no kite events for the selected date
    const availableStudentsFromBookings = useMemo(() => {
        return availableLessonsFromBookings.filter(lesson => {
            // Check if this lesson has any kite events in totalEvents (today's events)
            const hasKiteEventsToday = totalEvents.some(event => 
                event.lesson_id === lesson.lesson_id
            );
            
            // Return lessons that have NO kite events today
            return !hasKiteEventsToday;
        });
    }, [availableLessonsFromBookings, totalEvents]);

    // Create the TeacherEventLinkedList
    const teacherEventLinkedList = useMemo(() => {
        return new TeacherEventLinkedList(todayTeacherLessonsEvent, totalEvents);
    }, [todayTeacherLessonsEvent, totalEvents]);

    // Calculate the earliest time from all events
    const earliestTime = useMemo(() => {
        let earliest = '23:59';
        teacherEventLinkedList.getTeachers().forEach(teacher => {
            let current = teacher.eventHead;
            while (current) {
                if (current.event.time < earliest) {
                    earliest = current.event.time;
                }
                current = current.next;
            }
        });
        return earliest === '23:59' ? '11:00' : earliest; // Default to 11:00 if no events
    }, [teacherEventLinkedList]);

    const handleRemoveLesson = (lessonId: string) => {
        setSelectedLessonsForEvent(prev => prev.filter(l => l.lesson_id !== lessonId));
    };

    const handleClearAllLessons = () => {
        setSelectedLessonsForEvent([]);
    };

    const onStudentColumnClick = (lessonId: string) => {
        const lesson = availableStudentsFromBookings.find(l => l.lesson_id === lessonId);
        console.log('🔍 Click Debug:', {
            lessonId,
            foundLesson: lesson,
            hasTeacher: lesson?.teacher,
            teacherId: lesson?.teacher?.id,
            teacherName: lesson?.teacher?.name
        });
        if (lesson) {
            setSelectedLessonsForEvent(prev => {
                const exists = prev.some(l => l.lesson_id === lessonId);
                if (exists) {
                    return prev.filter(l => l.lesson_id !== lessonId);
                }
                return [...prev, lesson];
            });
        }
    };


    console.log("Todays Events:", totalEvents);
    return (
        <div className="dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-800">
            <WhiteboardNavigation
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
            />

            <div className="flex flex-col gap-2 p-2">
                <WhiteboardPins 
                    bookingsData={filteredBookings} 
                    selectedDate={selectedDate}
                    todayKiteEvents={totalEvents}
                />
                
                <EventController
                    selectedLessons={selectedLessonsForEvent}
                    selectedDate={selectedDate}
                    onRemoveLesson={handleRemoveLesson}
                    onClearAll={handleClearAllLessons}
                    teacherEventLinkedList={teacherEventLinkedList}
                    earliestTime={earliestTime}
                    todayKiteEvents={totalEvents}
                />

                <div className="grid grid-cols-12 gap-4 min-h-[600px]">
                    {/* Main Calendar/Planning Area */}
                    <div className="col-span-12 lg:col-span-9 h-full">
                        <WhiteboardCalendar 
                            selectedDate={selectedDate}
                            dateData={dateData}
                            teacherEventLinkedList={teacherEventLinkedList}
                            earliestTime={earliestTime}
                        />
                    </div>

                    {/* Right Column - Student and Teacher Entities */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full">
                        {/* Student Entity Column - Flex grow to take more space */}
                        <div className="flex-grow min-h-0">
                            <StudentEntityColumn
                                lessons={availableStudentsFromBookings}
                                onEntityClick={onStudentColumnClick}
                                selectedLessons={selectedLessonsForEvent}
                            />
                        </div>

                        {/* Teacher Entity Column - Fixed size */}
                        <div className="flex-shrink-0">
                            <TeacherEntityColumn
                                teacherConfirmationEvents={teacherConfirmationEvents}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}