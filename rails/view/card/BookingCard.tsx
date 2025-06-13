import React from 'react';
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { PackageStudentType } from "@/rails/model/PackageStudentModel";
import { BookingTag } from "../tag/BookingTag";
import { StudentTag } from "../tag/StudentTag";
import { LessonTag } from "../tag/LessonTag";
import { KiteEventTag } from "../tag/KiteEventTag";
import { TeacherTag } from "../tag/TeacherTag";
import PackageTag from "../tag/PackageTag";
import { ProgressBar } from "@/components/formatters";
import { LinkTeacherToLesson, TeacherParams } from '@/rails/view/link/LinkTeacherToLesson';

export interface BookingCardProps {
    booking: DrizzleData<BookingType>;
}

export function BookingCard({ booking }: BookingCardProps) {
    const packageData = (booking.relations as { package?: PackageStudentType }).package;
    const students = (booking.lambdas as { students?: Array<{ id: string; name: string; languages?: string }> })?.students || [];
    const lessons = (booking.relations as { lessons?: Array<{ id: string; status: string; teacher?: { id: string; name: string }; kiteEvents?: Array<{ id: string; duration: number; date: string; status?: string; location?: string; equipments?: Array<any> }> }> })?.lessons || [];

    // Extract all kite events from all lessons
    const allKiteEvents = lessons.flatMap(lesson => lesson.kiteEvents || []);

    // Function to get unique teachers as TeacherParams (only id and name)
    const getUniqueTeachers = (): TeacherParams[] => {
        // Get unique teachers from lessons
        return lessons
            .filter(lesson => lesson.teacher)
            .map(lesson => ({
                id: lesson.teacher!.id,
                name: lesson.teacher!.name
            }))
            .filter((teacher, index, self) =>
                index === self.findIndex(t => t.id === teacher.id)
            );
    };
    
    // Get the unique teachers
    const uniqueTeachers = getUniqueTeachers();

    // Calculate total kiting minutes from all kite events
    const totalKitingMinutes = allKiteEvents.reduce((sum, kiteEvent) => sum + (kiteEvent.duration || 0), 0);

    // Get package total minutes for progress calculation
    const packageMinutes = packageData?.duration || 0;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <BookingTag booking={booking.model} />

                {packageMinutes > 0 && (
                    <ProgressBar
                        usedMinutes={totalKitingMinutes}
                        totalMinutes={packageMinutes}
                    />
                )}
            </div>

            {packageData && (
                <PackageTag package={packageData} />
            )}

            {/* Lessons */}
            {lessons.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {lessons.map((lesson) => (
                        <LessonTag
                            key={lesson.id}
                            lesson={lesson}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-1">
                    <LinkTeacherToLesson
                        bookingId={booking.model.id}
                        teachers={uniqueTeachers}
                    />
                </div>
            )}

            {/* Kite Events */}
            {allKiteEvents.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {allKiteEvents.map((kiteEvent) => (
                        <KiteEventTag
                            key={kiteEvent.id}
                            kiteEvent={kiteEvent}
                        />
                    ))}
                </div>
            )}

            {/* Teachers */}
            {uniqueTeachers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {uniqueTeachers.map((teacher) => (
                        <TeacherTag
                            key={`teacher-${teacher.id}`}
                            teacher={teacher}
                        />
                    ))}
                </div>
            )}

            {/* Students */}
            {students.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {students.map((student) => (
                        <StudentTag
                            key={student.id}
                            student={student}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-xs text-muted-foreground font-medium px-3 py-1.5 border border-destructive/20 bg-destructive/5 rounded-md">
                    N/A Error, no students found
                </div>
            )}
        </div>
    );
}