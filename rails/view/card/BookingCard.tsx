import React from 'react';
import { cn } from "@/lib/utils";
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { PackageStudentType } from "@/rails/model/PackageStudentModel";
import { BookingTag } from "../tag/BookingTag";
import { StudentTag } from "../tag/StudentTag";
import { LessonTag } from "../tag/LessonTag";
import PackageTag from "../tag/PackageTag";
import { ProgressBar } from "@/components/formatters";
import { LinkTeacherToLesson } from '@/rails/view/link/LinkTeacherToLesson';
import { LinkStudentToBooking } from '@/rails/view/link/LinkStudentToBooking';

export interface BookingCardProps {
    booking: DrizzleData<BookingType>;
    headerClassName?: string;
}

export function BookingCard({ booking, headerClassName }: BookingCardProps) {
    const packageData = (booking.relations as { package?: PackageStudentType }).package;
    const students = (booking.lambdas as { students?: Array<{ id: string; name: string; languages?: string }> })?.students || [];
    const lessons = (booking.relations as { lessons?: Array<{ id: string; status: string; teacher?: { id: string; name: string }; kiteEvents?: Array<{ id: string; duration: number; date: string; status?: string; location?: string; equipments?: Array<any> }> }> })?.lessons || [];

    // Extract all kite events from all lessons
    const allKiteEvents = lessons.flatMap(lesson => lesson.kiteEvents || []);

    // Calculate total kiting minutes from all kite events
    const totalKitingMinutes = allKiteEvents.reduce((sum, kiteEvent) => sum + (kiteEvent.duration || 0), 0);

    // Get package total minutes for progress calculation
    const packageMinutes = packageData?.duration || 0;

    // Get package capacity for student validation
    const packageCapacity = packageData?.capacity || 0;

    // Check if we need to show "Add Students" link
    const needsMoreStudents = packageCapacity > 0 && students.length < packageCapacity;

    // Get current student IDs for filtering
    const currentStudentIds = students.map(student => student.id);

    return (
        <div className="flex flex-col gap-2 border rounded-sm">
            <div className={cn("flex items-center gap-2 pr-2 pl-1 py-2 border-b", headerClassName)}>
                <BookingTag booking={booking.model} />

                {packageMinutes > 0 && (
                    <ProgressBar
                        usedMinutes={totalKitingMinutes}
                        totalMinutes={packageMinutes}
                    />
                )}
            </div>

            <div className="px-1 pb-2 flex flex-col gap-1">

                {packageData && (
                    <div className="flex flex-wrap gap-1">
                        <PackageTag package={packageData} />
                    </div>
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
                        />
                    </div>
                )}

                {/* Kite Events */}
                {/* {allKiteEvents.length > 0 && (
                <div className="flex flex-wrap gap-1">
                {allKiteEvents.map((kiteEvent) => (
                    <KiteEventTag
                    key={kiteEvent.id}
                    kiteEvent={kiteEvent}
                    />
                    ))}
                    </div>
                    )} */}

                {/* Students */}
                {students.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {students.map((student) => (
                            <StudentTag
                                key={student.id}
                                student={student}
                            />
                        ))}
                        {needsMoreStudents && (
                            <LinkStudentToBooking
                                bookingId={booking.model.id}
                                currentStudentIds={currentStudentIds}
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        <div className="text-xs text-muted-foreground font-medium px-3 py-1.5 border border-destructive/20 bg-destructive/5 rounded-md">
                            N/A Error, no students found
                        </div>
                        {packageCapacity > 0 && (
                            <LinkStudentToBooking
                                bookingId={booking.model.id}
                                currentStudentIds={currentStudentIds}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}