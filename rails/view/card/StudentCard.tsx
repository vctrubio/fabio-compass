"use client";

import { KiteEventTag } from "@/rails/view/tag/KiteEventTag";
import { StudentTag } from "@/rails/view/tag/StudentTag";

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
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium">{event.time}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                    {event.duration}min • {event.location}
                </div>
                <div className="text-xs text-gray-500">{event.status}</div>
                {event.students.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {event.students.map(student => (
                            <span key={student.id} className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded">
                                {student.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
            <KiteEventTag kiteEvent={kiteEventForTag} />
            
            {event.students.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {event.students.map(student => (
                        <StudentTag 
                            key={student.id} 
                            student={{ 
                                model: { 
                                    id: student.id, 
                                    name: student.name 
                                } 
                            }} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}