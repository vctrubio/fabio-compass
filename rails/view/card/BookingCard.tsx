import React from 'react';
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { PackageStudentType } from "@/rails/model/PackageStudentModel";
import { BookingTag } from "../tag/BookingTag";
import { StudentTag } from "../tag/StudentTag";
import { LessonTag } from "../tag/LessonTag";
import { KiteEventTag } from "../tag/KiteEventTag";
import { TeacherTag } from "../tag/TeacherTag";
import { EquipmentTag } from "../tag/EquipmentTag";
import PackageTag from "../tag/PackageTag";

export interface BookingCardProps {
    booking: DrizzleData<BookingType>;
}

export function BookingCard({ booking }: BookingCardProps) {
    const packageData = (booking.relations as { package?: PackageStudentType }).package;
    const students = (booking.lambdas as { students?: Array<{ id: string; name: string; languages?: string }> })?.students || [];
    const lessons = (booking.relations as { lessons?: Array<{ id: string; status: string; teacher?: { name: string }; kiteEvents?: Array<{ id: string; duration: number; date: string; status?: string; location?: string; equipments?: Array<{ id: string; serialId?: string; type?: string; model?: string; size?: number }> }> }> })?.lessons || [];
    
    // Extract all kite events from all lessons
    const allKiteEvents = lessons.flatMap(lesson => lesson.kiteEvents || []);
    
    // Extract unique teachers from lessons
    const uniqueTeachers = lessons
        .map(lesson => lesson.teacher?.name)
        .filter((name, index, arr) => name && arr.indexOf(name) === index) as string[];
    
    // Extract all equipment from all kite events
    const allEquipments = allKiteEvents.flatMap(kiteEvent => kiteEvent.equipments || []);
    
    // Remove duplicate equipment by id
    const uniqueEquipments = allEquipments.filter((equipment, index, arr) => 
        arr.findIndex(e => e.id === equipment.id) === index
    );

    return (
        <div className="flex flex-col gap-2">
            <BookingTag
                dateRange={{
                    startDate: booking.model.date_start,
                    endDate: booking.model.date_end
                }}
            />

            {packageData && (
                <PackageTag
                    price={packageData.price}
                    duration={packageData.duration}
                    capacity={packageData.capacity}
                />
            )}

            {/* Lessons */}
            {lessons.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {lessons.map((lesson) => (
                        <LessonTag
                            key={lesson.id}
                            teacherName={lesson.teacher?.name || 'N/A PROBLEM'}
                            status={lesson.status}
                        />
                    ))}
                </div>
            )}

            {/* Kite Events */}
            {allKiteEvents.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {allKiteEvents.map((kiteEvent) => (
                        <KiteEventTag
                            key={kiteEvent.id}
                            duration={kiteEvent.duration}
                            date={kiteEvent.date}
                            status={kiteEvent.status}
                            location={kiteEvent.location}
                        />
                    ))}
                </div>
            )}

            {/* Teachers */}
            {uniqueTeachers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {uniqueTeachers.map((teacherName, index) => (
                        <TeacherTag
                            key={`teacher-${index}`}
                            name={teacherName}
                        />
                    ))}
                </div>
            )}

            {/* Equipment */}
            {uniqueEquipments.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {uniqueEquipments.map((equipment) => (
                        <EquipmentTag
                            key={equipment.id}
                            id={equipment.id}
                            serialId={equipment.serialId}
                            type={equipment.type}
                            model={equipment.model}
                            size={equipment.size}
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
                            name={student.name}
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