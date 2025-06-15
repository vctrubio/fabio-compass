"use client";

import { useState, useMemo, useEffect } from "react";
import { WhiteboardNavigation } from "./whiteboard-navigation";
import { WhiteboardCalendar } from "./whiteboard-calendar";
import { WhiteboardPins } from "./whiteboard-pins";
import { EventController } from "./event-controller";
import { StudentEntityColumn } from "./student-entity-column";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";
import { useAdmin } from "@/providers/AdminProvider";
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { useWhiteboardBackend } from "./whiteboard-backend";
import { LessonWithStudents } from "./types";

export default function WhiteboardPlanning() {
    const { bookingsData, teachersData } = useAdmin();
    const [selectedDate, setSelectedDate] = useState(new Date());

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

    // Form state for selected lessons
    const [selectedLessonsForEvent, setSelectedLessonsForEvent] = useState<LessonWithStudents[]>([]);

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
        availableLessonsFromBookings
    } = dateData;

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
        const lesson = availableLessonsFromBookings.find(l => l.lesson_id === lessonId);
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

                <div className="grid grid-cols-12 gap-4">
                    {/* Main Calendar/Planning Area */}
                    <div className="col-span-12 lg:col-span-9">
                        <WhiteboardCalendar 
                            selectedDate={selectedDate}
                            dateData={dateData}
                            teacherEventLinkedList={teacherEventLinkedList}
                            earliestTime={earliestTime}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="col-span-12 lg:col-span-3 space-y-4">
                        {/* Student Entity Column */}
                        <StudentEntityColumn
                            lessons={availableLessonsFromBookings}
                            onEntityClick={onStudentColumnClick}
                            selectedLessons={selectedLessonsForEvent}
                        />

                        {/* // this needs to change. it is the teachers that have a kite evnet toady and the status of that event is = teacherConfirmation // */}
                        {/* Teacher Entity Column - Only show if there are teachers with confirmation events */}
                        {/* {teacherConfirmationEvents && teacherConfirmationEvents.length > 0 && (
                            <TeacherEntityColumn
                                teachers={teacherConfirmationEvents
                                    .filter(tce => tce.teacher && tce.teacher.model)
                                    .map(tce => ({
                                        teacher_id: tce.teacher.model.id,
                                        teacher_name: tce.teacher.model.name,
                                        total_events: tce.events?.length || 0,
                                        status: 'active',
                                        confirmation_status: tce.confirmation_status as 'pending' | 'confirmed' | 'declined'
                                    }))}
                                onEntityClick={onTeacherColumnClick}
                                selectedTeachers={selectedTeachersForEvent}
                            />
                        )} */}
                    </div>
                </div>
            </div>
        </div>
    );
}