"use client";

import { EventCard } from "@/rails/view/card/EventCard";
import { KiteEventData } from "./types";
import { HeadsetIcon } from '@/assets/svg/HeadsetIcon';

interface TeacherEntityColumnProps {
    teacherConfirmationEvents: KiteEventData[];
}

export function TeacherEntityColumn({ teacherConfirmationEvents }: TeacherEntityColumnProps) {
    if (!teacherConfirmationEvents || teacherConfirmationEvents.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 border rounded-lg px-1 py-4 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 flex-shrink-0">
                <HeadsetIcon className="w-8 h-8" />
                Teachers
            </h2>
            <div className="overflow-y-auto flex-1">
                {teacherConfirmationEvents.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No teacher confirmation events
                    </div>
                ) : (
                    <div className="space-y-3">
                        {teacherConfirmationEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                viewMode="grid"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}