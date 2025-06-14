"use client";

import { useState, useMemo } from "react";
import { WhiteboardNavigation } from "./whiteboard-navigation";
import { WhiteboardCalendar } from "./whiteboard-calendar";
import { WhiteboardControl } from "./whiteboard-control";
import { WhiteboardPins } from "./whiteboard-pins";
import { EventController } from "./event-controller";
import { StudentEntityColumn } from "./student-entity-column";
import { TeacherEntityColumn } from "./teacher-entity-column";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";
import { useAdmin } from "@/components/providers/AdminProvider";
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { useWhiteboardBackend } from "./whiteboard-backend";

export default function WhiteboardPlanning() {
    const { bookingsData, teachersData } = useAdmin();
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Form state for selected lessons
    const [selectedLessonsForEvent, setSelectedLessonsForEvent] = useState<Array<{
        lessonId: string;
        studentNames: string[];
        teacherName: string;
        teacherId: string;
    }>>([]);

    // Form state for selected teachers
    const [selectedTeachersForEvent, setSelectedTeachersForEvent] = useState<Array<{
        teacherId: string;
        teacherName: string;
    }>>([]);

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
        todayBookings,
        todayTeacherLessonsEvent,
        totalEvents,
        plannedEvents,
        teacherConfirmationEvents,
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
        setSelectedLessonsForEvent(prev => prev.filter(l => l.lessonId !== lessonId));
    };

    const handleClearAllLessons = () => {
        setSelectedLessonsForEvent([]);
    };

    const onStudentColumnClick = (lessonId: string) => {
        const lesson = availableLessonsFromBookings.find(l => l.lesson_id === lessonId);
        if (lesson) {
            // Find the teacher ID by matching the teacher name
            const teacher = teachersData.find(t => t.model.name === lesson.teacher_name);
            const teacherId = teacher?.model.id || lesson.teacher_name || 'unknown';

            const newLesson = {
                lessonId: lesson.lesson_id,
                studentNames: lesson.student_names, // Keep as array instead of joining
                teacherName: lesson.teacher_name || 'Unknown Teacher',
                teacherId: teacherId,
            };

            setSelectedLessonsForEvent(prev => {
                const exists = prev.some(l => l.lessonId === newLesson.lessonId);
                if (exists) {
                    return prev.filter(l => l.lessonId !== newLesson.lessonId);
                }
                return [...prev, newLesson];
            });
        }
    };

    const onTeacherColumnClick = (teacherId: string) => {
        // Teacher confirmation clicks are handled differently
        // For now, we'll just log the click
        console.log('Teacher clicked:', teacherId);
    };

    return (
        <div className="dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-800">
            <WhiteboardNavigation
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />

            <div className="flex flex-col gap-2 p-2">
                <WhiteboardPins 
                    bookingsData={filteredBookings} 
                    selectedDate={selectedDate}
                    whiteboardData={whiteboardData}
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
                            bookingsData={filteredBookings}
                            whiteboardData={whiteboardData}
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

                        {/* Teacher Entity Column - Only show if there are teachers with confirmation events */}
                        {teacherConfirmationEvents && teacherConfirmationEvents.length > 0 && (
                            <TeacherEntityColumn
                                teachers={teacherConfirmationEvents
                                    .filter(tce => tce.teacher && tce.teacher.model)
                                    .map(tce => ({
                                        teacher_id: tce.teacher.model.id,
                                        teacher_name: tce.teacher.model.name,
                                        available_hours: 8, // Default available hours
                                        total_events: tce.events?.length || 0,
                                        status: 'active',
                                        confirmation_status: tce.confirmation_status as 'pending' | 'confirmed' | 'declined'
                                    }))}
                                onEntityClick={onTeacherColumnClick}
                                selectedTeachers={selectedTeachersForEvent}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}