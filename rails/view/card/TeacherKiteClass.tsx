"use client";
import { formatDuration } from "@/components/formatters";
import { MapPin } from "lucide-react";
import { HelmetIcon } from "@/assets/svg/HelmetIcon";
import { KiteEventData } from "@/components/hostelworld/types";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { TeacherKiteClassFooter } from "./TeacherKiteClassFooter"; // New footer component

export function TeacherKiteClass({
    event,
    viewFooter = false,
}: {
    event: KiteEventData;
    viewFooter?: boolean;
}) {
    const { id, time, duration, location, students, status, date, lesson_id } =
        event;
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg p-3 space-y-2 flex flex-col justify-between shadow-sm flex-grow">
                {/* Header: Start Time and Duration */}
                <div className="flex items-center justify-between pb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {time}
                    </h3>
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 text-sm font-medium text-green-700 dark:text-green-200">
                        +
                        {Number.isInteger(duration / 60)
                            ? duration / 60
                            : (duration / 60).toFixed(1)}
                    </span>
                </div>

                {/* Location */}
                <div className="flex justify-end items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span>{location}</span>
                    </div>
                </div>

                {/* Students */}
                {students.length > 0 && (
                    <>
                        <Separator className="my-2" />
                        <div className="flex flex-wrap gap-1 mt-auto">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs font-medium"
                                >
                                    <HelmetIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                    {student.name}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            {viewFooter && (
                <TeacherKiteClassFooter
                    id={id}
                    lesson_id={lesson_id}
                    status={status}
                    location={location}
                    time={time}
                    eventDate={date}
                    duration={duration}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                />
            )}
        </div>
    );
}
