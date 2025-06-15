"use client";

import { KiteEventTag } from "@/rails/view/tag/KiteEventTag";
import { StudentTag } from "@/rails/view/tag/StudentTag";
import { HelmetIcon } from "@/assets/svg/HelmetIcon";
import { formatDuration } from "@/components/formatters";

interface EventCardProps {
    event: {
        id: string;
        time: string;
        duration: number;
        date: string;
        status: string;
        location: string;
        students: Array<{
            id: string;
            name: string;
        }>;
    };
    viewMode?: 'grid' | 'print';
}

export function EventCard({ event, viewMode = 'grid' }: EventCardProps) {
    // Create kite event object for the tag
    const kiteEventForTag = {
        id: event.id,
        duration: event.duration,
        date: event.date,
        status: event.status,
        location: event.location,
        equipments: []
    };

    if (viewMode === 'print') {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-3 space-y-3">
                {/* Duration and Location Header */}
                <div className="flex items-center justify-between px-3">
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        {formatDuration(event.duration)}
                    </div>
                    {event.location && (
                        <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                            📍 {event.location}
                        </div>
                    )}
                </div>
                
                {/* Students Section */}
                {event.students.length > 0 && (
                    <div className="space-y-2">
                       
                        <div className="flex flex-wrap gap-2">
                            {event.students.map(student => (
                                <div key={student.id} className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-3 py-1.5 rounded-full text-xl font-medium">
                                    <HelmetIcon className="w-4 h-4" />
                                    {student.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg w-full p-2">
            <KiteEventTag kiteEvent={kiteEventForTag} viewFull={false} />
            {event.students.length > 0 && (
                <div className="mt-2 ml-2">
                    {event.students.map(student => (
                        <StudentTag
                            key={student.id}
                            name={student.name}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}